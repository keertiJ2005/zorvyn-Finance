import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtil } from '../../utils/response.util';
import { registerSchema, loginSchema } from '../../validators/user.validator';
import { ValidationError } from '../../types';

export class AuthController {
  
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        // mapping zod errors to our frontend format. took way too long to figure out 
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      const result = await AuthService.register(parsed.data);
      ResponseUtil.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      const result = await AuthService.login(parsed.data);
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
}
