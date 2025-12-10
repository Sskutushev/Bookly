// src/middleware/guest-auth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const guestOrAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // If req.user is already set by a previous auth middleware (e.g., JWT), do nothing.
  if (req.user) {
    return next();
  }

  const guestId = req.headers['x-guest-id'] as string;

  if (guestId) {
    try {
      let user = await prisma.user.findUnique({
        where: { guestId: guestId },
      });

      if (!user) {
        // Create a new guest user
        user = await prisma.user.create({
          data: {
            guestId: guestId,
            email: `${guestId}@guest.bookly.app`, // Dummy email
            name: 'Guest',
          },
        });
      }
      // Attach guest user to the request
      req.user = user;
    } catch (error) {
      console.error('Guest middleware error:', error);
      // Even if there's an error, we can proceed without a user object
    }
  }

  return next();
};
