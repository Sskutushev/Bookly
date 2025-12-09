// backend/src/middleware/telegram-auth.ts

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validateTelegramWebAppData = (initData: string): any => {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Sort parameters alphabetically
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create secret key
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Compare hashes
  if (calculatedHash !== hash) {
    throw new Error('Data validation failed');
  }

  // Check if data is not older than 1 day (86400 seconds)
  const authDate = urlParams.get('auth_date');
  if (authDate) {
    const authTime = parseInt(authDate, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authTime > 86400) {
      throw new Error('Auth date is too old');
    }
  }

  // Parse user data
  const userParam = urlParams.get('user');
  if (!userParam) {
    throw new Error('User data not found');
  }

  return JSON.parse(decodeURIComponent(userParam));
};

export const telegramAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return res.status(401).json({ message: 'Missing Telegram init data' });
    }

    // Validate the init data
    const telegramUser = validateTelegramWebAppData(initData);

    // Add user to request
    (req as any).telegramUser = telegramUser;

    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid Telegram data' });
  }
};