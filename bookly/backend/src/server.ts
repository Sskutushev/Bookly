import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes.ts';
import booksRoutes from './routes/books.routes.ts';
import userRoutes from './routes/user.routes.ts';
import paymentRoutes from './routes/payment.routes.ts';
import favoritesRoutes from './routes/favorites.routes.ts';
import myBooksRoutes from './routes/my-books.routes.ts';
import genresRoutes from './routes/genres.routes.ts';
import { jwtAuthMiddleware } from './middleware/jwt-auth.ts';
import { guestOrAuthMiddleware } from './middleware/guest-auth.ts';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not set in the environment. Please create a .env file with a valid PostgreSQL connection string.");
  process.exit(1); // Exit the process
}

const app = express();
const prisma = new PrismaClient();

// Serve static files from the uploads directory, making covers and books available.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bookly-bot.vercel.app',
  'https://bookly-bot-git-master.sskutushev.vercel.app', // Vercel preview deployment
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Check for Vercel subdomain pattern
    if (origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }

    // Not allowed
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Special handling for preflight requests before authentication
app.options('*', (req: Request, res: Response) => {
  // Set CORS headers for preflight
  if (!req.header('origin')) {
    res.status(200).send();
    return;
  }

  const origin = req.header('origin');
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://web.telegram.org');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Telegram-Init-Data');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Enable CORS for all routes before authentication
app.use(cors(corsOptions));

// Database connection check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// Authentication & Guest Middleware - applied after CORS
app.use(jwtAuthMiddleware);
app.use(guestOrAuthMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/my-books', myBooksRoutes);
app.use('/api/genres', genresRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;