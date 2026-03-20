import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuthContext();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-bold text-foreground">
        Build Your Perfect Resume
      </h1>
      <p className="mb-8 max-w-xl text-center text-lg text-muted-foreground">
        AI-powered resume builder designed for fresh graduates. Get
        ATS-optimized resumes and know your chances of landing that junior role.
      </p>
      <div className="flex gap-4">
        {user ? (
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-border px-6 py-3 text-foreground hover:bg-accent"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
