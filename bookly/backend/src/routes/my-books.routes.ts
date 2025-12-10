// backend/src/routes/my-books.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get user's books
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get books that are either purchased or have reading progress (for free books)
    const purchasedBooks = await prisma.purchase.findMany({
      where: {
        userId,
        status: 'completed',
      },
      include: {
        book: {
          include: {
            genres: true,
          },
        },
      },
    });

    // Get free books that the user has started reading
    const freeBooksWithProgress = await prisma.readingProgress.findMany({
      where: {
        userId,
        book: {
          isFree: true,
        },
      },
      include: {
        book: {
          include: {
            genres: true,
          },
        },
      },
    });

    // Format the response to include progress information
    const booksWithProgress = [];

    // Add purchased books with progress
    for (const item of purchasedBooks) {
      // Get reading progress for this book
      const progress = await prisma.readingProgress.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: item.bookId,
          },
        },
      });

      booksWithProgress.push({
        ...item.book,
        progress: progress ? progress.progress : 0,
        currentPage: progress ? progress.currentPage : 1,
      });
    }

    // Add free books with progress
    for (const rp of freeBooksWithProgress) {
      booksWithProgress.push({
        ...rp.book,
        progress: rp.progress,
        currentPage: rp.currentPage,
      });
    }

    res.json(booksWithProgress);
  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({ message: 'Failed to fetch user books' });
  }
});

// Get a specific book for reading
router.get('/:bookId/read', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has access to the book
    let hasAccess = book.isFree;

    if (!hasAccess) {
      // Check if the book was purchased
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId,
          bookId,
          status: 'completed',
        },
      });
      hasAccess = !!purchase;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this book' });
    }

    // Return book content (in a real app, you would return a signed URL or stream the content)
    res.json({
      bookId: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      coverUrl: book.coverUrl,
      contentUrl: book.pdfUrl, // This can point to .fb2 files as well
      isFree: book.isFree,
      price: book.price,
    });
  } catch (error) {
    console.error('Get book for reading error:', error);
    res.status(500).json({ message: 'Failed to fetch book content' });
  }
});

// Update reading progress
router.post('/:bookId/progress', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;
    const { currentPage, progress } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    if (typeof currentPage !== 'number' || typeof progress !== 'number') {
      return res.status(400).json({ message: 'Current page and progress are required' });
    }

    // Update or create reading progress
    const readingProgress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      update: {
        currentPage,
        progress,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        bookId,
        currentPage,
        progress,
      },
    });

    res.json(readingProgress);
  } catch (error) {
    console.error('Update reading progress error:', error);
    res.status(500).json({ message: 'Failed to update reading progress' });
  }
});

// Get reading progress for a book
router.get('/:bookId/progress', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'User ID and Book ID are required' });
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json(progress || { currentPage: 1, progress: 0 });
  } catch (error) {
    console.error('Get reading progress error:', error);
    res.status(500).json({ message: 'Failed to fetch reading progress' });
  }
});

// Add a book to user's library (creates initial reading progress)
router.post('/:bookId/add', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has access to the book
    let hasAccess = book.isFree;
    if (!hasAccess) {
      const purchase = await prisma.purchase.findFirst({
        where: { userId, bookId, status: 'completed' },
      });
      hasAccess = !!purchase;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this book' });
    }

    // Create or update reading progress
    const readingProgress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        lastReadAt: new Date(),
      },
      create: {
        userId,
        bookId,
        currentPage: 1,
        progress: 0,
      },
    });

    res.status(200).json({ message: 'Book added to library', readingProgress });
  } catch (error) {
    console.error('Add book to library error:', error);
    res.status(500).json({ message: 'Failed to add book to library' });
  }
});

export default router;