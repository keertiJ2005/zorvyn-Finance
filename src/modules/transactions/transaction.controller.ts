import { Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';
import { ResponseUtil } from '../../utils/response.util';
import { createTransactionSchema, updateTransactionSchema } from '../../validators/transaction.validator';
import { AuthRequest, TransactionQueryParams, ValidationError } from '../../types';

export class TransactionController {
  
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createTransactionSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      // the non-null assertion is safe here because the role middleware fires first
      const transaction = await TransactionService.create(parsed.data, req.user!.userId);
      ResponseUtil.created(res, transaction, 'Transaction created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // casting all these because express query parsing is notoriously messy
      const query: TransactionQueryParams = {
        type: req.query.type as TransactionQueryParams['type'],
        category: req.query.category as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page as string,
        limit: req.query.limit as string,
        sortBy: req.query.sortBy as string,
        order: req.query.order as 'asc' | 'desc',
        search: req.query.search as string,
      };

      const result = await TransactionService.getAll(query);
      ResponseUtil.success(
        res,
        result.transactions,
        'Transactions fetched successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transaction = await TransactionService.getById(req.params.id as string);
      ResponseUtil.success(res, transaction, 'Transaction fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateTransactionSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors: ValidationError[] = parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        ResponseUtil.error(res, 'Validation failed', 400, errors);
        return;
      }

      const transaction = await TransactionService.update(req.params.id as string, parsed.data);
      ResponseUtil.success(res, transaction, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transaction = await TransactionService.softDelete(req.params.id as string);
      ResponseUtil.success(res, transaction, 'Transaction soft-deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
