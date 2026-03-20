import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        Go Home
      </Link>
    </div>
  );
}
