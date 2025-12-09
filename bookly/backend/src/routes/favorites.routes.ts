// backend/src/routes/favorites.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get user's favorites
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            genres: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(favorites.map(fav => fav.book));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// Add book to favorites
router.post('/:bookId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Try to create favorite, ignore if already exists
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      update: {},
      create: {
        userId,
        bookId,
      },
    });

    res.json({ message: 'Book added to favorites', favoriteId: favorite.id });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Failed to add book to favorites' });
  }
});

// Remove book from favorites
router.delete('/:bookId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        bookId,
      },
    });

    res.json({ message: 'Book removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Failed to remove book from favorites' });
  }
});

export default router;