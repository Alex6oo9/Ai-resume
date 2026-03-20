import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    try {
      await forgotPassword(email);
      setStatus('sent');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Reset your password
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === 'sent' ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:bg-green-950/50 dark:border-green-800">
            <div className="mb-3 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mb-1 font-medium text-green-800 dark:text-green-400">Check your email</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
