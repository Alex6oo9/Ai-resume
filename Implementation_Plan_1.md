Here is the complete Claude Code implementation brief. Copy and paste this entire document directly into Claude Code.

***

# Implementation Brief: Password Reset & Email Verification

## Context — Your Existing Stack

- **Backend:** Node.js + Express 4 + TypeScript, PostgreSQL, `express-session` with Passport.js, `bcrypt` for passwords, `express-validator` for validation, `Helmet.js` for security headers [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/65179782-df0b-4750-abde-573ddca0be96/SERVER.md)
- **Frontend:** React 18 + TypeScript + Vite SPA, Axios with `withCredentials: true`, existing `useAuth` hook with `{ user, loading, login, register, logout }` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/7d8b0f65-2838-4d3c-8aef-2aff101e2201/CLIENT.md)
- **Auth endpoints currently:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/65179782-df0b-4750-abde-573ddca0be96/SERVER.md)
- **Users table currently:** `id UUID PK`, `name VARCHAR(255)`, `email VARCHAR(255) UNIQUE`, `password VARCHAR(255)`, `created_at TIMESTAMP` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/65179782-df0b-4750-abde-573ddca0be96/SERVER.md)
- **Existing client routes:** `/`, `/login`, `/register`, `/dashboard`, `/upload`, `/build`, `/build/:id`, `/resume/:id` — all protected except the first three [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/7d8b0f65-2838-4d3c-8aef-2aff101e2201/CLIENT.md)
- **Migration tracking:** The app uses a numbered migrations system, currently up to migration `019` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/65179782-df0b-4750-abde-573ddca0be96/SERVER.md)
- **Error response format:** `{ "message": "string", "errors"?: { "field": "message" } }` [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/160129925/65179782-df0b-4750-abde-573ddca0be96/SERVER.md)

***

## Libraries to Install

### Server
```
npm install resend                  # Email sending (free tier: 3,000 emails/month)
npm install crypto                  # Built-in Node.js — no install needed, just import
```

**Why Resend over Nodemailer:** Resend has a simple REST API, TypeScript-first SDK, free tier sufficient for early users, reliable deliverability, and takes 5 minutes to set up vs. configuring an SMTP server. Sign up at resend.com and get an API key — no credit card needed for the free tier.

### Client
No new packages needed — uses existing Axios, React Router v6, TailwindCSS, and toast library already in your project.

***

## New Environment Variables to Add

Add these to your `.env` file and your production environment variable manager:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx         # From resend.com dashboard
EMAIL_FROM=noreply@yourdomain.com      # Must be a verified domain in Resend
CLIENT_URL=http://localhost:5173       # Already exists — used in reset link
```

> **Important for Resend free tier:** You must verify a domain in the Resend dashboard. During development, you can use Resend's onboarding test address or verify `yourdomain.com`. Emails sent to unverified domains will fail silently.

***

## Feature 1: Email Verification on Register

### How It Works (Full Flow)

```
User fills register form
→ POST /api/auth/register
→ Server creates user with is_email_verified = false
→ Server generates a random 32-byte hex token
→ Server stores token + expiry (24 hours) in email_verification_tokens table
→ Server sends verification email via Resend with link: {CLIENT_URL}/verify-email?token=xxx
→ Server responds 201 with { user, message: "Check your email to verify your account" }
→ User is NOT logged in yet — session is NOT created on register
→ User clicks link in email
→ GET /api/auth/verify-email?token=xxx
→ Server validates token (exists, not expired, not used)
→ Server sets users.is_email_verified = true
→ Server deletes the token row
→ Server redirects to /login?verified=true  (or returns 200 JSON)
→ Login page shows "Email verified! You can now log in."
→ POST /api/auth/login checks is_email_verified = true before creating session
→ Unverified users get 403 with message: "Please verify your email before logging in. Check your inbox."
```

### Database Changes — Migration 020

Create a new migration file `server/src/db/migrations/020_email_verification.sql`:

```sql
-- Add email verification status to users table
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN NOT NULL DEFAULT false;

-- For existing users (if any), mark them as already verified so they aren't locked out
UPDATE users SET is_email_verified = true;

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);
```

### New Server Files to Create

**`server/src/services/email/emailService.ts`**
- Initialize Resend client with `process.env.RESEND_API_KEY`
- Export `sendVerificationEmail(to: string, name: string, token: string): Promise<void>`
  - Subject: `"Verify your email — [Your App Name]"`
  - HTML body: A clean, minimal email with a prominent button linking to `${CLIENT_URL}/verify-email?token=${token}`. Include the user's name, a brief "Thanks for signing up" message, and a note that the link expires in 24 hours. Plain text fallback required.
- Export `sendPasswordResetEmail(to: string, name: string, token: string): Promise<void>`
  - Subject: `"Reset your password — [Your App Name]"`
  - HTML body: A clean email with a prominent "Reset Password" button linking to `${CLIENT_URL}/reset-password?token=${token}`. Note that the link expires in 1 hour. If they didn't request it, they can ignore the email.
- Both functions should `throw new Error('Email sending failed')` on Resend API error so the calling controller can catch and return 500.

**`server/src/utils/tokenUtils.ts`**
- Export `generateToken(): string` — uses `crypto.randomBytes(32).toString('hex')` to produce a 64-char hex string
- Export `hashToken(token: string): string` — uses `crypto.createHash('sha256').update(token).digest('hex')` — store the hash in the DB, send the raw token in the email. This prevents token exposure if the DB is compromised.

> **Note to Claude Code:** Store the SHA-256 hash in the DB column, send the raw token in the email URL. On verification/reset, hash the incoming token and compare against the DB.

### Modified Server Files

**`server/src/controllers/authController.ts`** — Modify `register`:
1. After inserting the new user row, do NOT create a session
2. Generate a raw token via `generateToken()`, hash it via `hashToken()`
3. Insert into `email_verification_tokens`: `(user_id, token=hash, expires_at=NOW() + INTERVAL '24 hours')`
4. Call `sendVerificationEmail(email, name, rawToken)`
5. Return `201 { message: "Registration successful. Please check your email to verify your account." }` — **do not return the user object yet** since they aren't authenticated

**`server/src/controllers/authController.ts`** — Modify `login`:
1. After validating credentials, before creating the session, check `users.is_email_verified`
2. If `false`, return `403 { message: "Please verify your email before logging in. Check your inbox or request a new verification email." }`
3. Only create the session if `is_email_verified = true`

**`server/src/routes/auth/index.ts`** — Add two new routes:
- `GET /api/auth/verify-email` — calls `verifyEmail` controller (no auth required)
- `POST /api/auth/resend-verification` — calls `resendVerification` controller (no auth required, rate limit: 3 requests/hour by IP)

**New controller functions to add to `authController.ts`:**

`verifyEmail(req, res)`:
1. Read `token` from `req.query.token`
2. If missing: return `400 { message: "Verification token is required" }`
3. Hash the incoming token with `hashToken()`
4. Query `email_verification_tokens` WHERE `token = hash AND expires_at > NOW()`
5. If not found: return `400 { message: "Invalid or expired verification link. Please request a new one." }`
6. Set `users.is_email_verified = true` for the associated `user_id`
7. Delete the token row
8. Return `200 { message: "Email verified successfully. You can now log in." }`

`resendVerification(req, res)`:
1. Read `email` from `req.body`
2. Validate email is non-empty and valid format
3. Find user by email — if not found, return `200 { message: "If this email exists, a verification link has been sent." }` (don't leak whether email exists)
4. If `is_email_verified = true`, return `400 { message: "This email is already verified." }`
5. Delete any existing tokens for this user in `email_verification_tokens`
6. Generate new token, insert, send email
7. Return `200 { message: "Verification email sent. Please check your inbox." }`

***

## Feature 2: Password Reset Flow

### How It Works (Full Flow)

```
User clicks "Forgot Password?" on /login page
→ Navigates to /forgot-password
→ Enters email address
→ POST /api/auth/forgot-password { email }
→ Server always responds 200 (don't leak if email exists)
→ If email exists and is_email_verified: generate token, store hash, send reset email
→ Email contains: {CLIENT_URL}/reset-password?token=xxx (expires in 1 hour)
→ User clicks link
→ Navigates to /reset-password?token=xxx
→ Page reads token from URL, shows new password form
→ POST /api/auth/reset-password { token, newPassword }
→ Server validates token, hashes new password with bcrypt, updates users.password
→ Server deletes ALL password reset tokens for this user
→ Server destroys all existing sessions for this user (security: logout everywhere)
→ Returns 200 { message: "Password reset successful. You can now log in." }
→ Client redirects to /login?reset=true
→ Login page shows "Password reset successfully! Log in with your new password."
```

### Database Changes — Migration 021

Create `server/src/db/migrations/021_password_reset.sql`:

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
```

### New Controller Functions in `authController.ts`

`forgotPassword(req, res)`:
1. Read and validate `email` from `req.body` — must be non-empty valid email format
2. Always return `200 { message: "If an account with that email exists, we've sent a password reset link." }` — respond BEFORE doing any DB work to prevent timing attacks
3. In the background (after responding or in the same async block before responding — choose non-async response pattern carefully):
   - Find user by email
   - If not found: stop silently
   - If `is_email_verified = false`: stop silently (or optionally redirect to verify email first — your call)
   - Delete any existing `password_reset_tokens` rows for this user
   - Generate raw token, store hash with `expires_at = NOW() + INTERVAL '1 hour'`
   - Call `sendPasswordResetEmail(email, name, rawToken)`
   - Swallow email errors silently (log but don't throw — user already got 200)

> **Note to Claude Code:** The safest pattern here is to `await` everything inside a `try/catch` that only logs errors, and still always return 200 before any await. Use a fire-and-forget pattern only if you're comfortable with it; otherwise just await and always return 200 regardless of internal errors.

`resetPassword(req, res)`:
1. Read `token` (string) and `newPassword` (string) from `req.body`
2. Validate: both required; `newPassword` minimum 6 characters (match existing register validation)
3. Hash the incoming token with `hashToken()`
4. Query `password_reset_tokens` WHERE `token = hash AND expires_at > NOW()`
5. If not found: return `400 { message: "Invalid or expired reset link. Please request a new one." }`
6. Hash new password with `bcrypt.hash(newPassword, 12)`
7. Update `users.password` for the associated `user_id`
8. Delete ALL `password_reset_tokens` rows for this user (not just the current one)
9. Delete all sessions for this user from the PostgreSQL `session` table: `DELETE FROM session WHERE sess::jsonb->'passport'->>'user' = userId` — this logs them out everywhere
10. Return `200 { message: "Password reset successful. You can now log in with your new password." }`

### New Routes in `server/src/routes/auth/index.ts`

```
POST /api/auth/forgot-password     → forgotPassword controller (no auth, rate limit: 5/hour by IP)
POST /api/auth/reset-password      → resetPassword controller (no auth)
```

Apply a **strict rate limiter** to `forgot-password`: max 5 requests per hour per IP. This is the most abuse-prone endpoint.

***

## New Client Routes & Pages

Add these routes to your React Router config. All are **public** (no auth required):

| Route | Component | Purpose |
|---|---|---|
| `/verify-email` | `VerifyEmailPage.tsx` | Handles `?token=xxx` from email link |
| `/forgot-password` | `ForgotPasswordPage.tsx` | Email input form |
| `/reset-password` | `ResetPasswordPage.tsx` | New password form, reads `?token=xxx` |

### New Client API Functions in `client/src/utils/api.ts`

Add these alongside existing auth functions:

- `verifyEmail(token: string)` → `GET /auth/verify-email?token=${token}` → `{ message }`
- `resendVerification(email: string)` → `POST /auth/resend-verification` → `{ message }`
- `forgotPassword(email: string)` → `POST /auth/forgot-password` → `{ message }`
- `resetPassword(token: string, newPassword: string)` → `POST /auth/reset-password` → `{ message }`

### Page Specifications

**`client/src/pages/VerifyEmailPage.tsx`**

On mount:
1. Read `token` from `useSearchParams()`
2. If no token: show error state — "Invalid verification link. Please check your email or request a new one."
3. If token present: immediately call `verifyEmail(token)` — show loading spinner while pending
4. On success: show green success state — "Your email has been verified! You can now log in." with a button linking to `/login`
5. On error (400/expired): show error state with a form to enter their email and a "Resend verification email" button that calls `resendVerification(email)`
6. On resend success: show "Verification email sent. Check your inbox."

**`client/src/pages/ForgotPasswordPage.tsx`**

UI:
- Single email input field with label "Your email address"
- Submit button "Send Reset Link" — disables + shows spinner on loading
- A "Back to Login" link at the bottom

Logic:
1. On submit: call `forgotPassword(email)`
2. On success (always 200): replace the form with a success message — "If an account exists for that email, we've sent a reset link. Check your inbox (and spam folder)."
3. On network error: show generic error toast — "Something went wrong. Please try again."
4. Do not re-enable the form after success (prevents spam clicking)

**`client/src/pages/ResetPasswordPage.tsx`**

On mount:
1. Read `token` from `useSearchParams()`
2. If no token: immediately show error — "Invalid reset link. Please request a new one." with link to `/forgot-password`

UI:
- New password input (type="password", min 6 chars, show/hide toggle)
- Confirm password input (type="password", show/hide toggle)
- Client-side validation: both fields required; passwords must match; minimum 6 chars
- Submit button "Reset Password" — disables + shows spinner on loading

Logic:
1. On submit with valid inputs: call `resetPassword(token, newPassword)`
2. On success: redirect to `/login?reset=true`
3. On 400 (expired/invalid token): show error — "This reset link has expired or already been used. Please request a new one." with link to `/forgot-password`
4. On 500: generic error toast

### Modify Existing Client Pages

**`client/src/pages/RegisterPage.tsx`** — After successful registration:
- Do NOT redirect to `/dashboard`
- Replace form with a success state: "Account created! We've sent a verification email to `{email}`. Click the link to activate your account."
- Show a small "Didn't receive it?" section with a button that navigates to a page where they can resend — or inline resend if preferred
- Remove any auto-login behavior after register (since `useAuth.register` currently logs in immediately — this must change)

**`client/src/pages/LoginPage.tsx`** — Add:
1. "Forgot password?" link below the password field → navigates to `/forgot-password`
2. Read `?verified=true` from URL params on mount → show green banner "Email verified! You can now log in."
3. Read `?reset=true` from URL params on mount → show green banner "Password reset successful! Log in with your new password."
4. If server returns 403 on login attempt: show the message with an additional "Resend verification email" button that opens an inline email input + calls `resendVerification`

**`client/src/hooks/useAuth.ts`** — Modify `register` function:
- Currently likely sets `user` state after register — change it to return `{ success: true, email }` without setting `user` state, since the user is not authenticated until verified
- The `register` call response from server is now `{ message }` (no `user` object), so this is a contract change that must be handled

***

## Updated API Contract Summary

Add these to your `CLIENT.md` under Authentication:

```
POST /auth/forgot-password   — { email } → 200 { message } (always 200)
POST /auth/reset-password    — { token, newPassword } → 200 { message }
                               400 { message } if invalid/expired
GET  /auth/verify-email      — ?token=xxx → 200 { message }
                               400 { message } if invalid/expired
POST /auth/resend-verification — { email } → 200 { message } (always 200)
```

**Modified contracts:**
```
POST /auth/register  — Now returns 201 { message } (no user object, no session created)
POST /auth/login     — Now returns 403 { message } if email not verified
```

***

## Security Rules to Enforce

1. **Always return 200 from `forgot-password` and `resend-verification`** regardless of whether the email exists — prevents email enumeration attacks
2. **Store token hashes, not raw tokens** in the DB — use SHA-256 via `crypto`
3. **Token expiry:** verification = 24 hours, password reset = 1 hour
4. **One active token per user per type** — delete old tokens before inserting new ones
5. **Invalidate all sessions on password reset** — delete from the `session` PostgreSQL table
6. **Rate limit forgot-password** — 5 requests/hour per IP using your existing `express-rate-limit` setup
7. **bcrypt cost factor:** use `12` for new password hashes (may already be your default — keep consistent)
8. **Do not log raw tokens** anywhere — only log user IDs and actions

***

## Edge Cases Claude Code Must Handle

- User registers, never verifies, tries to register again with same email → return `400 { message: "An account with this email already exists." }` (same as before — don't reveal verification status)
- User tries to use an already-used verification token → the row is deleted after first use, so it returns "invalid or expired" which is correct
- User requests two password reset emails — second request deletes the first token, so only the latest link works
- `sendVerificationEmail` or `sendPasswordResetEmail` throws (Resend API down) → catch in controller, log the error, return `500 { message: "Failed to send email. Please try again." }` — do NOT create the user if the verification email fails on register
- Existing users in the DB have `is_email_verified = false` after migration (before the `UPDATE users SET is_email_verified = true` runs) — make sure migration 020 runs the UPDATE before the app serves traffic