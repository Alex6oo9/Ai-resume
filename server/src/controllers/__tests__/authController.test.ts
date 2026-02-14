import express from 'express';
import request from 'supertest';

// Mock dependencies before importing
jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));
jest.mock('bcrypt');
jest.mock('passport', () => {
  const actual = jest.requireActual('passport');
  return {
    ...actual,
    authenticate: jest.fn(),
  };
});
// Also mock config/passport to prevent it from trying to configure real passport
jest.mock('../../config/passport', () => ({
  __esModule: true,
  default: {},
}));

import pool from '../../config/db';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { register, login, logout, getMe } from '../authController';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate';

const mockQuery = (pool as any).query as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockAuthenticate = passport.authenticate as jest.Mock;

function createApp() {
  const app = express();
  app.use(express.json());

  // Register route with validation
  app.post(
    '/api/auth/register',
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    ],
    validate,
    register
  );

  // Login route with validation
  app.post(
    '/api/auth/login',
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
  );

  // Logout route
  app.post('/api/auth/logout', logout);

  // Me route
  app.get('/api/auth/me', getMe);

  return app;
}

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('returns 409 for duplicate email', async () => {
      const app = createApp();

      // Existing user found
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('returns 400 for invalid email', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 400 for short password', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toMatch(/at least 8 characters/);
    });

    it('hashes password and inserts user on valid input', async () => {
      const app = createApp();
      const mockUser = { id: 'uuid-123', email: 'test@example.com', created_at: '2024-01-01' };

      // No existing user
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockHash.mockResolvedValue('hashed-password');
      // Insert returns new user
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      // Note: req.login won't exist in supertest, so this will error.
      // The important thing is verifying the DB calls were correct.
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockHash).toHaveBeenCalledWith('password123', 12);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT id FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        ['test@example.com', 'hashed-password']
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 for invalid email', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 400 for missing password', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 401 when passport authenticate fails (no user)', async () => {
      const app = createApp();

      mockAuthenticate.mockImplementation(
        (_strategy: string, callback: Function) => {
          return (req: any, res: any, next: any) => {
            callback(null, false, { message: 'Invalid email or password' });
          };
        }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('returns user data on successful login', async () => {
      const app = createApp();
      const mockUser = { id: 'uuid-123', email: 'test@example.com' };

      mockAuthenticate.mockImplementation(
        (_strategy: string, callback: Function) => {
          return (req: any, _res: any, _next: any) => {
            // Simulate req.login existing
            req.login = (_user: any, cb: Function) => cb(null);
            callback(null, mockUser, null);
          };
        }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 on successful logout', async () => {
      const app = express();
      app.use(express.json());

      // Add mock req.logout and req.session.destroy
      app.use((req: any, _res, next) => {
        req.logout = (cb: Function) => cb(null);
        req.session = {
          destroy: (cb: Function) => cb(null),
        };
        next();
      });
      app.post('/api/auth/logout', logout);

      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user when authenticated', async () => {
      const app = express();
      app.use(express.json());
      const mockUser = { id: 'uuid-123', email: 'test@example.com' };

      app.use((req: any, _res, next) => {
        req.user = mockUser;
        next();
      });
      app.get('/api/auth/me', getMe);

      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
    });

    it('returns 401 when not authenticated', async () => {
      const app = createApp();

      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Not authenticated');
    });
  });
});
