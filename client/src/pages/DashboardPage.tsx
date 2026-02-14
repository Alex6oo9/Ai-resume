import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ResumeSummary } from '../types';
import { listResumes, deleteResume } from '../utils/api';
import { useToastContext } from '../contexts/ToastContext';

interface DashboardPageProps {
  user: User;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const { showToast } = useToastContext();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await listResumes();
        setResumes(data.resumes);
      } catch {
        setError('Failed to load resumes.');
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      showToast('Resume deleted');
    } catch {
      showToast('Failed to delete resume', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Welcome, {user.email.split('@')[0]}
      </h1>
      <p className="mb-8 text-gray-600">
        Choose how you'd like to create your resume.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Path A: Upload Resume */}
        <div className="rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Upload Existing Resume
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Upload your PDF resume and get AI-powered analysis, ATS scoring, and
            improvement suggestions.
          </p>
          <Link
            to="/upload"
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Upload Resume
          </Link>
        </div>

        {/* Path B: Build from Scratch */}
        <div className="rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Build from Scratch
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Answer a few questions and let AI generate a professional,
            ATS-optimized resume for you.
          </p>
          <Link
            to="/build"
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Start Building
          </Link>
        </div>
      </div>

      {/* Resume List */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Your Resumes
        </h2>

        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-20 rounded-lg bg-gray-200" />
            <div className="h-20 rounded-lg bg-gray-200" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && resumes.length === 0 && (
          <p className="text-sm text-gray-500">
            No resumes yet. Upload one or build from scratch to get started.
          </p>
        )}

        {!loading && resumes.length > 0 && (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm transition hover:shadow-md"
              >
                <Link
                  to={`/resume/${resume.id}`}
                  className="flex flex-1 items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {resume.target_role || 'Untitled Resume'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {resume.match_percentage !== null && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">
                          {resume.match_percentage}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    )}
                    {resume.ats_score !== null && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {resume.ats_score}
                        </div>
                        <div className="text-xs text-gray-500">ATS</div>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="ml-4 rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${resume.target_role || 'resume'}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
