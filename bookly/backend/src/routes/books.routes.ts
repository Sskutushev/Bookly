// backend/src/routes/books.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all books with filters
router.get('/', async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 12 } = req.query;

    const whereClause: any = {};

    // Filter by genre
    if (genre && genre !== 'all') {
      whereClause.genres = {
        some: {
          name: genre as string,
        },
      };
    }

    // Search by title or author
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.book.count({
      where: whereClause,
    });

    // Get books with pagination
    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        genres: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      books,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user from request (if authenticated)
    const userId = (req as any).user?.id;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // If user is authenticated, check if book is in favorites or purchased
    if (userId) {
      const [favorite, purchase] = await Promise.all([
        prisma.favorite.findFirst({
          where: {
            userId,
            bookId: id,
          },
        }),
        prisma.purchase.findFirst({
          where: {
            userId,
            bookId: id,
            status: 'completed',
          },
        }),
      ]);

      (book as any).isFavorite = !!favorite;
      (book as any).isPurchased = !!purchase;
    }

    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

// Get book fragment (first 15 pages)
router.get('/:id/fragment', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, you would extract the first 15 pages from the PDF
    // For now, returning a placeholder
    res.json({
      fragment: 'This is a sample fragment of the book...',
      totalPages: 15,
    });
  } catch (error) {
    console.error('Get book fragment error:', error);
    res.status(500).json({ message: 'Failed to fetch book fragment' });
  }
});

// Get all genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    res.json(genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      bookCount: genre._count.books,
    })));
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ message: 'Failed to fetch genres' });
  }
});

export default router;