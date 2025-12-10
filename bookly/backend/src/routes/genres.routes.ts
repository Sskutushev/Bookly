// src/routes/genres.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

console.log('--- [DEBUG] Genres Router Loaded ---');

const prisma = new PrismaClient();
const router = Router();

// GET /api/genres - Get all genres
router.get('/', async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(genres);
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: 'Could not fetch genres' });
  }
});

export default router;
