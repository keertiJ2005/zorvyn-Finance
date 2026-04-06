import { z } from 'zod';
import { TransactionType } from '../types';

export const createTransactionSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    // guarding against js floating point weirdness with absurdly huge numbers
    .max(999999999.99, 'Amount exceeds maximum allowed value'),
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required')
    .max(50, 'Category must be at most 50 characters')
    .trim(),
  date: z
    // some clients pass weird date formats, using strict parse
    .string({ required_error: 'Date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const updateTransactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    .max(999999999.99, 'Amount exceeds maximum allowed value')
    .optional(),
  type: z
    .nativeEnum(TransactionType, {
      errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
    })
    .optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category must be at most 50 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
