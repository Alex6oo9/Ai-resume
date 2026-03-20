import { useState, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../utils/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">Invalid Link</h2>
          <p className="mb-4 text-muted-foreground">This password reset link is invalid or missing a token.</p>
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');

    try {
      await resetPassword(token, password);
      setStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed. The link may be expired.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Password Reset</h2>
          <p className="mb-6 text-muted-foreground">Your password has been reset successfully.</p>
          <Link
            to="/login?reset=true"
            className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
          Set new password
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
