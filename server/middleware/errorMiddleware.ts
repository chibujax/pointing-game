// server/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';

// Type for structured API errors
interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Global error handler
export const globalErrorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Set default values
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  
  // Structure the error response
  const errorResponse = {
    status: 'error',
    message: err.message || 'Something went wrong',
    ...(isProd ? {} : { stack: err.stack })
  };
  
  // Log error in development
  if (!isProd) {
    console.error('[Error]', err);
  }
  
  // Send the appropriate response
  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.method} ${req.originalUrl}`
  });
};

// Helper to create custom API errors
export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};