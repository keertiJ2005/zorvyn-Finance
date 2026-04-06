import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.util';

// factory so we can just pass roles right in the route definition
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // should never hit this if authenticate middleware runs first, but typscript complains
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
