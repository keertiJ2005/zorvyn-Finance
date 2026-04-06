import { Request } from 'express';

export enum Role {
  VIEWER = 'VIEWER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// TODO: maybe move this to a separate typings file if it gets too big
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// passing everything as strings from req.query to avoid weird type overrides
export interface TransactionQueryParams {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalTransactions: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  type: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface WeeklySummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  startDate: string;
  endDate: string;
}
