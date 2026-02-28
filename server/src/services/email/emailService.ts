import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Resume Builder <noreply@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

export async function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string
): Promise<void> {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  const greeting = name ? `Hi ${name}` : 'Hi';

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Verify your email</h2>
      <p>${greeting},</p>
      <p>Thanks for signing up for AI Resume Builder. Please verify your email address by clicking the button below.</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link: ${verifyUrl}</p>
      <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
  `;

  if (!resend) {
    console.log('\n──── DEV: Verification Email ────');
    console.log(`To: ${email}`);
    console.log(`Frontend:   ${verifyUrl}`);
    console.log(`Direct API: ${API_URL}/auth/verify-email?token=${token}`);
    console.log(`Token: ${token}`);
    console.log('─────────────────────────────────\n');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your email — AI Resume Builder',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string
): Promise<void> {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
  const greeting = name ? `Hi ${name}` : 'Hi';

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Reset your password</h2>
      <p>${greeting},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link: ${resetUrl}</p>
      <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (!resend) {
    console.log('\n──── DEV: Password Reset Email ────');
    console.log(`To: ${email}`);
    console.log(`Frontend:   ${resetUrl}`);
    console.log(`Direct API: ${API_URL}/auth/reset-password (POST with token + password)`);
    console.log(`Token: ${token}`);
    console.log('───────────────────────────────────\n');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your password — AI Resume Builder',
    html,
  });
}
