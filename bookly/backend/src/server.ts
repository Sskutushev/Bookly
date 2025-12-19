// Using Neon DB via connection string in .env
// Environment variables are loaded from the .env file in the root of the backend directory
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import favoritesRoutes from './routes/favorites.routes';
import myBooksRoutes from './routes/my-books.routes';
import genresRoutes from './routes/genres.routes';
import { jwtAuthMiddleware } from './middleware/jwt-auth';
import { guestOrAuthMiddleware } from './middleware/guest-auth';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not set in the environment. Please create a .env file with a valid PostgreSQL connection string.");
  process.exit(1); // Exit the process
}

const app = express();
const prisma = new PrismaClient();

// Serve static files from the uploads directory, making covers and books available.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);


// CORS middleware
const allowedOrigins = [
  'https://bookly-pied.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log('Incoming Origin:', origin); // Debugging line
    
    // Allow requests with no origin (like mobile apps or curl requests) or from localhost.
    if (!origin || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // Allow any Vercel preview URL or the main production URL.
    const vercelRegex = /https:\/\/.*\.vercel\.app$/;
    if (vercelRegex.test(origin)) {
      return callback(null, true);
    }

    // Check against the explicit list for any other cases.
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Telegram-Init-Data', 'X-Guest-ID', 'X-Forwarded-For', 'X-Real-IP'],
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public routes (auth)
app.use('/api/auth', authRoutes);

// Authentication & Guest Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // If it's an OPTIONS request, skip authentication (should not reach here due to CORS, but for safety)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Otherwise, apply authentication
  jwtAuthMiddleware(req, res, () => {
    guestOrAuthMiddleware(req, res, next);
  });
});

// Database connection check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// Protected Routes
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