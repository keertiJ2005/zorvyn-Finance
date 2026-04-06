import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors.util';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token is missing');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // this blew up in prod once, keeping the explicit check just in case
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // dealing with weird jwt errors that dont map neatly to our custom ones
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token has expired'));
    } else {
      next(error);
    }
  }
};
