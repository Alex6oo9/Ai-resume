import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import MatchScoreCard from '../components/analysis/MatchScoreCard';
import AtsScoreCard from '../components/analysis/AtsScoreCard';
import ImprovementSuggestions from '../components/analysis/ImprovementSuggestions';
import ExportButtons from '../components/export/ExportButtons';
import {
  getResume,
  getMatchAnalysis,
  getAtsScore,
  getImprovements,
  exportPdf,
  exportMarkdown,
} from '../utils/api';
import type { AtsScoreBreakdown, DetailedImprovements } from '../types';

export default function ResumeAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToastContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Match data
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // ATS data
  const [atsBreakdown, setAtsBreakdown] = useState<AtsScoreBreakdown | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // Improvements data
  const [detailed, setDetailed] = useState<DetailedImprovements | null>(null);
  const [improvementsLoading, setImprovementsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError('Invalid resume ID');
        setLoading(false);
        return;
      }

      try {
        const [resumeRes, matchRes] = await Promise.all([
          getResume(id),
          getMatchAnalysis(id),
        ]);

        setTargetRole(resumeRes.resume.target_role || '');
        setMatchPercentage(matchRes.matchPercentage);
        setStrengths(matchRes.strengths);
        setWeaknesses(matchRes.weaknesses);
        setSuggestions(matchRes.suggestions);
        setDataLoaded(true);
      } catch {
        setError('Failed to load analysis data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleCalculateAts = async () => {
    if (!id) return;
    setAtsLoading(true);
    try {
      const result = await getAtsScore(id);
      setAtsBreakdown(result.atsBreakdown);
    } catch {
      setError('Failed to calculate ATS score.');
    } finally {
      setAtsLoading(false);
    }
  };

  const handleAnalyzeImprovements = async () => {
    if (!id) return;
    setImprovementsLoading(true);
    try {
      const result = await getImprovements(id);
      setDetailed(result.detailed);
    } catch {
      setError('Failed to get improvement suggestions.');
    } finally {
      setImprovementsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-48 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error && !matchPercentage) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-red-600">{error}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
          {targetRole && (
            <p className="text-sm text-gray-500">Target: {targetRole}</p>
          )}
        </div>
        <Link
          to="/dashboard"
          className="text-sm text-indigo-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <MatchScoreCard
          matchPercentage={matchPercentage}
          strengths={strengths}
          weaknesses={weaknesses}
          loading={false}
        />

        <AtsScoreCard
          atsBreakdown={atsBreakdown}
          loading={atsLoading}
          onCalculate={handleCalculateAts}
        />

        <ImprovementSuggestions
          suggestions={suggestions}
          detailed={detailed}
          loading={improvementsLoading}
          onAnalyze={handleAnalyzeImprovements}
        />

        <ExportButtons
          onExportPdf={async () => {
            if (!id) {
              showToast('Invalid resume ID', 'error');
              return;
            }
            if (!dataLoaded) {
              showToast('Please wait for data to load', 'error');
              return;
            }
            try {
              await exportPdf(id);
              showToast('PDF exported successfully');
            } catch (err: any) {
              const errorMsg =
                err?.response?.data?.error ||
                err?.response?.data?.errors?.[0]?.msg ||
                'Failed to export PDF';
              showToast(errorMsg, 'error');
            }
          }}
          onExportMarkdown={async () => {
            if (!id) {
              showToast('Invalid resume ID', 'error');
              return;
            }
            if (!dataLoaded) {
              showToast('Please wait for data to load', 'error');
              return;
            }
            try {
              await exportMarkdown(id);
              showToast('Markdown exported successfully');
            } catch (err: any) {
              const errorMsg =
                err?.response?.data?.error ||
                err?.response?.data?.errors?.[0]?.msg ||
                'Failed to export Markdown';
              showToast(errorMsg, 'error');
            }
          }}
        />
      </div>
    </div>
  );
}
