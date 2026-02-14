import { Link } from 'react-router-dom';
import { User } from '../types';

interface HomePageProps {
  user: User | null;
}

export default function HomePage({ user }: HomePageProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Build Your Perfect Resume
      </h1>
      <p className="mb-8 max-w-xl text-center text-lg text-gray-600">
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
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
