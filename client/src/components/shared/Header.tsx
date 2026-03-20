import { Link } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({ isDark, onToggleTheme }: HeaderProps) {
  const { user, logout: onLogout } = useAuthContext();

  const initials = user
    ? (user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.slice(0, 2).toUpperCase())
    : '';

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            ProResumeAI
            <span className="text-xs font-normal text-muted-foreground">.app</span>
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          {user && (
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search documents..."
                readOnly
                className="bg-muted/40 dark:bg-muted/20 border border-border rounded-full h-9 w-60 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Divider */}
          {user && <div className="hidden sm:block w-px h-5 bg-border" />}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle dark mode"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-default">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground">{initials}</span>
                </div>
              </div>
              {/* Logout */}
              <button
                onClick={onLogout}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-foreground hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
