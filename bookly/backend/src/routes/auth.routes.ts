// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { validateTelegramWebAppData } from '../middleware/telegram-auth';

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