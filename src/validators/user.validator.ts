import { z } from 'zod';
import { Role, UserStatus } from '../types';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    // maybe increase this later, 6 is kinda weak but leaving for now
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z
    .nativeEnum(Role, { errorMap: () => ({ message: 'Role must be VIEWER, ANALYST, or ADMIN' }) })
    .optional()
    .default(Role.VIEWER),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'), // just check if it exists, dont need length check on login
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Role must be VIEWER, ANALYST, or ADMIN' }),
  }),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
