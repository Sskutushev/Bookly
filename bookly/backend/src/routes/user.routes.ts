// backend/src/routes/user.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    // Create unique filename with user ID and timestamp
    const userId = (req as any).user?.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

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
    const { name, avatar, email, currentPassword, newPassword, passwordForConfirmation } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if trying to update email
    if (email) {
      // In a real app, you would verify the current password before changing the email
      if (!passwordForConfirmation) {
        return res.status(400).json({ message: 'Current password is required to change email' });
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password) {
        return res.status(400).json({ message: 'Password is not set' });
      }

      const bcryptModule = await import('bcrypt');
      const isPasswordValid = await bcryptModule.compare(passwordForConfirmation, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid current password' });
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Check if trying to update password
    if (currentPassword && newPassword) {
      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password) {
        return res.status(400).json({ message: 'Password is not set' });
      }

      const bcryptModule2 = await import('bcrypt');
      const isPasswordValid = await bcryptModule2.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid current password' });
      }

      // Hash the new password
      const bcrypt = await import('bcrypt');
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update with new password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          avatar: avatar || undefined,
          email: email || undefined,
          password: hashedNewPassword
        },
      });

      const { password, refresh_token, ...userData } = updatedUser;
      res.json(userData);
      return;
    }

    // Update user with other fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
        email: email || undefined
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
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    // Get user ID from request
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Update user's avatar in the database with the file path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    res.json({ 
      avatarUrl: `${process.env.API_BASE_URL || 'http://localhost:8080'}${avatarUrl}`,
      message: 'Avatar uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    if (error.message === 'Only image files are allowed!') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
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