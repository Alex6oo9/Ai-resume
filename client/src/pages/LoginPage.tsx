import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import { resendVerification } from '../utils/api';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<unknown>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToastContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const verified = searchParams.get('verified') === 'true';
  const reset = searchParams.get('reset') === 'true';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      await onLogin(email, password);
      showToast('Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 403 && data?.email) {
        setUnverifiedEmail(data.email);
        setError(data.error);
      } else {
        setError(data?.error || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResendStatus('sending');
    try {
      await resendVerification(unverifiedEmail);
    } catch {
      // Don't reveal errors
    }
    setResendStatus('sent');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>

        {verified && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Email verified successfully. You can now sign in.
          </div>
        )}

        {reset && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Password reset successfully. Sign in with your new password.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <p>{error}</p>
            {unverifiedEmail && (
              <button
                onClick={handleResend}
                disabled={resendStatus !== 'idle'}
                className="mt-2 text-indigo-600 hover:text-indigo-500 underline disabled:opacity-50"
              >
                {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Verification link sent' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
