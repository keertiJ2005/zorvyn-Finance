import { Response } from 'express';
import { ApiResponse, PaginationMeta, ValidationError } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Request successful',
    statusCode: number = 200,
    pagination?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors?: ValidationError[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      statusCode,
      message,
    };

    // frontend team asked for specifically this errors array format
    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}
