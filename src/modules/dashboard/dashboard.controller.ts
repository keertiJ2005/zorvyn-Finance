import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { ResponseUtil } from '../../utils/response.util';
import { AuthRequest } from '../../types';

export class DashboardController {
  
  static async getSummary(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await DashboardService.getSummary();
      ResponseUtil.success(res, summary, 'Dashboard summary fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const breakdown = await DashboardService.getCategoryBreakdown();
      ResponseUtil.success(res, breakdown, 'Category breakdown fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyTrends(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trends = await DashboardService.getMonthlyTrends();
      ResponseUtil.success(res, trends, 'Monthly trends fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRecentActivity(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await DashboardService.getRecentActivity();
      ResponseUtil.success(res, activity, 'Recent activity fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getWeeklySummary(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await DashboardService.getWeeklySummary();
      ResponseUtil.success(res, summary, 'Weekly summary fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
