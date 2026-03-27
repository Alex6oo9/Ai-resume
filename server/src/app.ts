process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from './config/passport';
import pool from './config/db';
import { errorHandler } from './middleware/errorHandler';

function routeTimeout(ms: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) res.status(503).json({ error: 'Request timed out' });
    }, ms);
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import analysisRoutes from './routes/analysis';
import exportRoutes from './routes/export';
import aiRoutes from './routes/ai';
import templateRoutes from './routes/templates';
import coverLetterRoutes from './routes/coverLetter';

const app = express();

// Trust the first proxy hop (required on Render so secure cookies work over HTTPS)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Session store
const PgSession = connectPgSimple(session);

const isProduction = process.env.NODE_ENV === 'production';

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      domain: isProduction ? '.proresumeai.app' : undefined,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-route timeouts (before rate limiters and handlers)
app.use('/api/analysis', routeTimeout(90000));
app.use('/api/ai', routeTimeout(90000));
app.use('/api/export', routeTimeout(90000));
app.use('/api/cover-letter', routeTimeout(90000));
app.use('/api/resume/upload-simple', routeTimeout(90000));
app.use('/api/resume/upload', routeTimeout(90000));
app.use('/api/resume/parse-text', routeTimeout(60000));
app.use('/api', routeTimeout(30000));

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/analysis', aiLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/cover-letter', coverLetterRoutes);

// Health check
app.get('/api/health', async (_req, res) => {
  const checks: Record<string, unknown> = { api: 'ok' };
  try {
    const t = Date.now();
    await pool.query('SELECT 1');
    checks.db = { status: 'ok', latencyMs: Date.now() - t };
  } catch {
    checks.db = { status: 'degraded' };
  }
  const status = (checks.db as { status: string }).status === 'ok' ? 'healthy' : 'degraded';
  res.set('Cache-Control', 'no-cache').json({ status, timestamp: new Date().toISOString(), checks });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
