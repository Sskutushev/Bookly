// backend/src/routes/user.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notifications: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without sensitive information
    const { password, refresh_token, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { name, avatar } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar,
      },
    });

    const { password, refresh_token, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', async (req, res) => {
  try {
    // In a real app, you would process file upload here
    // For now, returning a placeholder
    res.json({ avatarUrl: 'https://example.com/avatar.jpg' });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Get user purchases
router.get('/purchases', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        status: 'completed',
      },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});

// Update notification settings
router.patch('/notifications/settings', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const {
      newBooksInGenre,
      unfinishedReminder,
      specialOffers,
      newsAndUpdates,
      frequency,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Create or update notification settings
    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        newBooksInGenre,
        unfinishedReminder,
        specialOffers,
        newsAndUpdates,
        frequency,
      },
      create: {
        userId,
        newBooksInGenre,
        unfinishedReminder,
        specialOffers,
        newsAndUpdates,
        frequency,
      },
    });

    res.json(notificationSettings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Failed to update notification settings' });
  }
});

export default router;