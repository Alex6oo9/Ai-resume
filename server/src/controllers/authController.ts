import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import pool from '../config/db';

const SALT_ROUNDS = 12;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    const user = result.rows[0];

    // Auto-login after registration
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ user: { id: user.id, email: user.email } });
    });
  } catch (err) {
    next(err);
  }
};

export const login = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    'local',
    (err: Error | null, user: any, info: { message: string }) => {
      if (err) return next(err);

      if (!user) {
        res.status(401).json({ error: info?.message || 'Login failed' });
        return;
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ user: { id: user.id, email: user.email } });
      });
    }
  )(req, res, next);
};

export const logout = (req: Request, res: Response): void => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Session destruction failed' });
        return;
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
};

export const getMe = (req: Request, res: Response): void => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};
