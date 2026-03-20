import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../utils/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { User } from '../types';

export default function VerifyEmailPage() {
  const { setUser: onVerified } = useAuthContext();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || null;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [autoLoggedIn, setAutoLoggedIn] = useState(false);
  const navigate = useNavigate();

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    verifyEmail(token)
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
        if (data.autoLogin && data.user) {
          setAutoLoggedIn(true);
          onVerified(data.user as User);
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may be expired.');
      });
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendStatus('sending');
    try {
      await resendVerification(resendEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('sent'); // Don't reveal if email exists
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 rounded-full mx-auto flex h-16 w-16 items-center justify-center bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Email Verified</h2>
            <p className="mb-6 text-muted-foreground">{message}</p>
            {autoLoggedIn ? (
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            ) : (
              <Link
                to="/login?verified=true"
                className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 rounded-full mx-auto flex h-16 w-16 items-center justify-center bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Verification Failed</h2>
            <p className="mb-6 text-muted-foreground">{message}</p>

            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-3 text-sm text-muted-foreground">Need a new verification link?</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleResend}
                  disabled={resendStatus !== 'idle' || !resendEmail}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent' : 'Resend'}
                </button>
              </div>
              {resendStatus === 'sent' && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">If an account exists, a new link has been sent.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
