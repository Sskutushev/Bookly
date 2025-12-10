// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { validateTelegramWebAppData } from '../middleware/telegram-auth';
import { generateTwoFactorSecret, verifyTwoFactorToken, generateTwoFactorQR } from '../services/two-factor.service';
import {
  generatePasswordResetToken,
  resetPassword,
  sendPasswordResetEmail
} from '../services/password-reset.service';

const router = Router();
const prisma = new PrismaClient();

// Telegram authentication
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ message: 'Init data is required' });
    }

    // Validate Telegram init data
    const telegramUser = validateTelegramWebAppData(initData);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegram_id: telegramUser.id.toString() },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegram_id: telegramUser.id.toString(),
          name: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
          telegram_username: telegramUser.username || '',
          email: `${telegramUser.id}@bookly.telegram`,
        },
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { expiresIn: '7d' }
    );

    // Update user with refresh token (in a real app, you might store this in a separate table)
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegram_id: user.telegram_id,
        avatar: user.avatar,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    ) as { userId: string };

    // Check if the refresh token exists in DB (in a real app)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );

    res.json({
      access_token: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you would invalidate the refresh token here
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Setup 2FA
router.post('/2fa/setup', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new 2FA secret
    const secret = generateTwoFactorSecret(user.email);

    // Save the secret to user record (in a real app, you'd want to save it encrypted)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    // Generate QR code URL
    const qrCodeUrl = generateTwoFactorQR(secret.base32, user.email);

    res.json({
      secret: secret.base32,
      qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: '2FA setup failed' });
  }
});

// Verify 2FA setup
router.post('/2fa/verify', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up for this user' });
    }

    // Verify the token
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);

    if (isValid) {
      // 2FA is valid, enable it for the user
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });

      res.json({ verified: true, message: '2FA verified successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: '2FA verification failed' });
  }
});

// Disable 2FA
router.post('/2fa/disable', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false
      },
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

// Authenticate with 2FA
router.post('/2fa/authenticate', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    // Verify the token
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);

    if (isValid) {
      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user.id, telegramId: user.telegram_id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        { expiresIn: '7d' }
      );

      res.json({
        authenticated: true,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } else {
      res.status(400).json({ authenticated: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('2FA authenticate error:', error);
    res.status(500).json({ message: '2FA authentication failed' });
  }
});

// Registration (for non-Telegram users)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate password reset token
    const token = await generatePasswordResetToken(email);

    // Send password reset email
    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Forgot password request failed' });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Validate password strength (at least 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Reset the password
    await resetPassword(token, newPassword);

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Password reset failed' });
  }
});

// Login (for non-Telegram users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { expiresIn: '7d' }
    );

    // Update user with refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegram_id: user.telegram_id,
        avatar: user.avatar,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;