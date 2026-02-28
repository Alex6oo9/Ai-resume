import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import pool from '../config/db';
import { generateToken, hashToken } from '../utils/tokenUtils';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email/emailService';

const SALT_ROUNDS = 12;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

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
      'INSERT INTO users (email, password_hash, name, is_email_verified) VALUES ($1, $2, $3, FALSE) RETURNING id, email, name',
      [email, passwordHash, name || null]
    );

    const user = result.rows[0];

    // Generate verification token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    // Send verification email (don't fail registration if email fails)
    try {
      await sendVerificationEmail(email, user.name, token);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.status(201).json({ message: 'Account created. Please check your email to verify your account.' });
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

      // Check email verification
      if (!user.is_email_verified) {
        res.status(403).json({ error: 'Please verify your email before logging in.', email: user.email });
        return;
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
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

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.query.token;

    if (!rawToken || typeof rawToken !== 'string') {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    const token = rawToken.trim();
    const tokenHash = hashToken(token);

    const result = await pool.query(
      `SELECT evt.*, u.email FROM email_verification_tokens evt
       JOIN users u ON u.id = evt.user_id
       WHERE evt.token_hash = $1 AND evt.expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired verification link' });
      return;
    }

    const { user_id } = result.rows[0];

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_email_verified = TRUE WHERE id = $1',
      [user_id]
    );

    // Delete all verification tokens for this user
    await pool.query(
      'DELETE FROM email_verification_tokens WHERE user_id = $1',
      [user_id]
    );

    // Auto-login: fetch user and create session
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [user_id]
    );
    const verifiedUser = userResult.rows[0];

    req.login(verifiedUser, (loginErr) => {
      if (loginErr) {
        // Verification succeeded but auto-login failed — fall back to manual login
        res.json({ message: 'Email verified successfully. You can now log in.', autoLogin: false });
        return;
      }
      res.json({ message: 'Email verified successfully!', autoLogin: true, user: { id: verifiedUser.id, email: verifiedUser.email, name: verifiedUser.name } });
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const userResult = await pool.query(
      'SELECT id, email, name, is_email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal whether user exists
      res.json({ message: 'If an account exists with that email, a verification link has been sent.' });
      return;
    }

    const user = userResult.rows[0];

    if (user.is_email_verified) {
      res.json({ message: 'If an account exists with that email, a verification link has been sent.' });
      return;
    }

    // Delete old tokens
    await pool.query(
      'DELETE FROM email_verification_tokens WHERE user_id = $1',
      [user.id]
    );

    // Generate new token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.json({ message: 'If an account exists with that email, a verification link has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Always return same message to prevent email enumeration
    const successMsg = 'If an account exists with that email, a password reset link has been sent.';

    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.json({ message: successMsg });
      return;
    }

    const user = userResult.rows[0];

    // Delete old unused tokens
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = FALSE',
      [user.id]
    );

    // Generate new token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr);
    }

    res.json({ message: successMsg });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token: rawToken, password } = req.body;

    if (!rawToken || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const token = rawToken.trim();
    const tokenHash = hashToken(token);

    const result = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset link' });
      return;
    }

    const { user_id } = result.rows[0];

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update password and mark email as verified (they proved email ownership)
    await pool.query(
      'UPDATE users SET password_hash = $1, is_email_verified = TRUE WHERE id = $2',
      [passwordHash, user_id]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = $1',
      [tokenHash]
    );

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
};
