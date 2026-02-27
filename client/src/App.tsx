import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { ToastContext } from './contexts/ToastContext';
import Header from './components/shared/Header';
import Toast from './components/shared/Toast';
import ProtectedRoute from './components/shared/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import NotFoundPage from './pages/NotFoundPage';
import SkillsDemo from './pages/SkillsDemo';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header user={user} onLogout={logout} />
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route
              path="/register"
              element={<RegisterPage onRegister={register} />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <DashboardPage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute user={user}>
                  <ResumeUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/build"
              element={
                <ProtectedRoute user={user}>
                  <ResumeBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/build/:id"
              element={
                <ProtectedRoute user={user}>
                  <ResumeBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume/:id"
              element={
                <ProtectedRoute user={user}>
                  <ResumeAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route path="/demo/skills" element={<SkillsDemo />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
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
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
