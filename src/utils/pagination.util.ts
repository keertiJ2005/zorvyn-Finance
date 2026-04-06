import { PaginationMeta } from '../types';

// quick util to avoid repeating this math in every single list endpoint
export class PaginationUtil {
  static parseParams(page?: string, limit?: string): { skip: number; take: number; page: number; limit: number } {
    const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
    
    // capping at 100 so nobody tries to ddos us by requesting 1 million rows at once
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit || '10', 10) || 10));

    return {
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  static buildMeta(page: number, limit: number, total: number): PaginationMeta {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
