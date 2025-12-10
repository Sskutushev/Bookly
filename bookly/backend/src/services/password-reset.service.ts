import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Generate a password reset token
export const generatePasswordResetToken = async (email: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

  // Save the token to the database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    },
  });

  return token;
};

// Verify a password reset token
export const verifyPasswordResetToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date(), // Greater than (not expired)
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  return user;
};

// Reset user password
export const resetPassword = async (token: string, newPassword: string) => {
  // Verify the token
  const user = await verifyPasswordResetToken(token);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password and clear the reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return user;
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Create a proper reset link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  // Create a transporter using environment variables or default settings
  const transporter = nodemailer.createTransport({
    // In production, use actual email service (Gmail, SendGrid, etc.)
    // For development, using test configuration:
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@bookly.com',
    to: email,
    subject: 'Password Reset Request - Bookly',
    html: `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password for your Bookly account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#8B7FF5; color:white; text-decoration:none; border-radius:5px; margin:20px 0;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return resetLink;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // In a real app, you would have fallback notification methods
    throw new Error('Failed to send password reset email');
  }
};