import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // AppError — use its status code
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Multer errors (file too large, wrong type)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : err.message;
    res.status(400).json({ error: message });
    return;
  }

  // JSON parse errors
  if ((err as any).type === 'entity.parse.failed' || err.message?.includes('JSON')) {
    res.status(400).json({ error: 'Invalid JSON in request body' });
    return;
  }

  // Log stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.stack || err.message);
  } else {
    console.error('Error:', err.message);
  }

  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};
