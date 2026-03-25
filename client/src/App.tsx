import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useToast } from './hooks/useToast';
import { ToastContext } from './contexts/ToastContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import Header from './components/shared/Header';
import ServerDownBanner from './components/shared/ServerDownBanner';
import Toast from './components/shared/Toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import UploadedResumeViewPage from './pages/UploadedResumeViewPage';
import CoverLetterPage from './pages/CoverLetterPage';
import NotFoundPage from './pages/NotFoundPage';
import SkillsDemo from './pages/SkillsDemo';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ThumbnailPreviewPage from './pages/ThumbnailPreviewPage';

function ProtectedLayout() {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppLayout() {
  // No useAuthContext() here — ProtectedLayout handles auth gating for protected routes
  const { toasts, showToast, removeToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isBuilderRoute =
    location.pathname.startsWith('/build') ||
    location.pathname === '/thumbnail-preview' ||
    location.pathname.startsWith('/cover-letter') ||
    /^\/resume\/[^/]+\/view$/.test(location.pathname);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ServerDownBanner onRecovered={() => showToast('Server is back online', 'success')} />
      <div className="min-h-screen bg-background">
        {!isBuilderRoute && <Header isDark={isDark} onToggleTheme={toggleTheme} />}
        <Outlet />
      </div>

      {/* Toast container */}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/upload', element: <Navigate to="/dashboard" replace /> },
          { path: '/build', element: <ResumeBuilderPage /> },
          { path: '/build/:id', element: <ResumeBuilderPage /> },
          { path: '/resume/:id', element: <ResumeAnalysisPage /> },
          { path: '/resume/:id/view', element: <UploadedResumeViewPage /> },
          { path: '/cover-letter/new', element: <CoverLetterPage /> },
        ],
      },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/demo/skills', element: <SkillsDemo /> },
      { path: '/thumbnail-preview', element: <ThumbnailPreviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <ConnectivityProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ConnectivityProvider>
    </ThemeProvider>
  );
}
