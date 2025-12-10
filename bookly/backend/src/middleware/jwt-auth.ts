// src/middleware/jwt-auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const jwtAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token, but we can allow guest access if handled by a later middleware
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user) {
      // Attach the authenticated user to the request
      req.user = user;
    }
  } catch (error: any) {
    // Invalid token, but we don't block the request.
    // Downstream routes will need to check if req.user exists.
    // This allows for guest access on the same routes.
    console.log('JWT validation error:', error.message);
  }

  return next();
};
