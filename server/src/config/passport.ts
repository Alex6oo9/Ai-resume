import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import pool from './db';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: 'No email returned from Google' });
        }

        // 1. Find by google_id
        let result = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [profile.id]
        );

        if (result.rows[0]) {
          return done(null, result.rows[0]);
        }

        // 2. Find by email — link google_id
        result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows[0]) {
          const updated = await pool.query(
            `UPDATE users
             SET google_id = $1, auth_provider = 'google', is_email_verified = TRUE, updated_at = NOW()
             WHERE id = $2
             RETURNING id, email, name, is_email_verified, created_at`,
            [profile.id, result.rows[0].id]
          );
          return done(null, updated.rows[0]);
        }

        // 3. Create new user
        const name =
          profile.displayName ||
          [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') ||
          null;

        const inserted = await pool.query(
          `INSERT INTO users (email, name, google_id, auth_provider, is_email_verified, created_at, updated_at)
           VALUES ($1, $2, $3, 'google', TRUE, NOW(), NOW())
           RETURNING id, email, name, is_email_verified, created_at`,
          [email, name, profile.id]
        );

        return done(null, inserted.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('[passport] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth will not work');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, is_email_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err);
  }
});

export default passport;
