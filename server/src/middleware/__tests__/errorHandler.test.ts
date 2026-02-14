import express from 'express';
import request from 'supertest';
import multer from 'multer';
import { errorHandler, AppError } from '../errorHandler';

function createApp(error: Error) {
  const app = express();
  app.get('/test', (_req, _res, next) => {
    next(error);
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns 500 for generic Error', async () => {
    const app = createApp(new Error('Something broke'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Something broke');
  });

  it('returns custom status code for AppError', async () => {
    const app = createApp(new AppError('Not found', 404));

    const res = await request(app).get('/test');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  it('returns 400 for AppError with 400 status', async () => {
    const app = createApp(new AppError('Bad request data', 400));

    const res = await request(app).get('/test');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad request data');
  });

  it('returns 400 for Multer file size error', async () => {
    const multerError = new multer.MulterError('LIMIT_FILE_SIZE');
    const app = createApp(multerError as any);

    const res = await request(app).get('/test');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('File is too large');
  });

  it('returns 400 for other Multer errors', async () => {
    const multerError = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    const app = createApp(multerError as any);

    const res = await request(app).get('/test');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Unexpected field');
  });

  it('hides error details in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = createApp(new Error('secret internal error'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });

  it('shows error details in development', async () => {
    process.env.NODE_ENV = 'development';
    const app = createApp(new Error('debug info here'));

    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('debug info here');
  });

  it('AppError has isOperational flag', () => {
    const err = new AppError('test', 422);
    expect(err.isOperational).toBe(true);
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe('test');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });
});
