import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ResponseUtil } from '../../utils/response.util';
import { updateRoleSchema, updateStatusSchema } from '../../validators/user.validator';
import { ValidationError } from '../../types';

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as { page?: string; limit?: string };
      const result = await UserService.getAllUsers(page, limit);
      ResponseUtil.success(res, result.users, 'Users fetched successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id as string);
      ResponseUtil.success(res, user, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateRoleSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      const user = await UserService.updateRole(req.params.id as string, parsed.data.role);
      ResponseUtil.success(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateStatusSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      const user = await UserService.updateStatus(req.params.id as string, parsed.data.status);
      ResponseUtil.success(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UserService.deleteUser(req.params.id as string);
      ResponseUtil.success(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
