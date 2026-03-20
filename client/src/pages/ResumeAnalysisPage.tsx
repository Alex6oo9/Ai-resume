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
  exportPdfWithTemplate,
  exportMarkdown,
  reanalyzeResume,
  getAnalysisHistory,
} from '../utils/api';
import type { AtsScoreBreakdown, DetailedImprovements, ResumeFormData } from '../types';

interface AnalysisHistoryEntry {
  id: string;
  target_role: string | null;
  job_description: string | null;
  match_percentage: number;
  ai_analysis: {
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  };
  created_at: string;
}

export default function ResumeAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToastContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [resumeFormData, setResumeFormData] = useState<ResumeFormData | null>(null);
  const [templateId, setTemplateId] = useState('modern_minimal');

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

  // PDF viewer (Path A only)
  const [hasFile, setHasFile] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  // Analysis history
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Re-analyze panel
  const [showReanalyze, setShowReanalyze] = useState(false);
  const [reanalyzeLoading, setReanalyzeLoading] = useState(false);
  const [reanalyzeRole, setReanalyzeRole] = useState('');
  const [reanalyzeJd, setReanalyzeJd] = useState('');
  const [showReanalyzeJd, setShowReanalyzeJd] = useState(false);
  const JD_MAX_LENGTH = 5000;

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError('Invalid resume ID');
        setLoading(false);
        return;
      }

      try {
        const [resumeRes, matchRes, historyRes] = await Promise.all([
          getResume(id),
          getMatchAnalysis(id),
          getAnalysisHistory(id).catch(() => ({ history: [] })),
        ]);

        setTargetRole(resumeRes.resume.target_role || '');
        setTargetCountry(resumeRes.resume.target_country || '');
        setTargetCity(resumeRes.resume.target_city || '');
        setJobDescription(resumeRes.resume.job_description || '');
        setHasFile(!!resumeRes.resume.file_path);
        setReanalyzeRole(resumeRes.resume.target_role || '');
        setReanalyzeJd(resumeRes.resume.job_description || '');
        if (resumeRes.resume.job_description) {
          setShowReanalyzeJd(true);
        }
        if (resumeRes.resume.form_data) {
          setResumeFormData(resumeRes.resume.form_data);
        }
        if (resumeRes.resume.template_id) {
          setTemplateId(resumeRes.resume.template_id);
        }
        setMatchPercentage(matchRes.matchPercentage);
        setStrengths(matchRes.strengths);
        setWeaknesses(matchRes.weaknesses);
        setSuggestions(matchRes.suggestions);
        setHistory(historyRes.history || []);
        if (historyRes.history?.length > 0) {
          setActiveHistoryId(historyRes.history[0].id);
        }
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
    const forceRefresh = detailed !== null;
    setImprovementsLoading(true);
    try {
      const result = await getImprovements(id, forceRefresh);
      setDetailed(result.detailed);
    } catch {
      setError('Failed to get improvement suggestions.');
    } finally {
      setImprovementsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!id || !reanalyzeRole.trim()) return;
    setReanalyzeLoading(true);
    try {
      const result = await reanalyzeResume(id, {
        targetRole: reanalyzeRole,
        targetCountry: targetCountry || undefined,
        targetCity: targetCity || undefined,
        jobDescription: showReanalyzeJd ? reanalyzeJd : undefined,
      });
      setTargetRole(reanalyzeRole);
      setJobDescription(showReanalyzeJd ? reanalyzeJd : '');
      setMatchPercentage(result.matchPercentage);
      setStrengths(result.strengths);
      setWeaknesses(result.weaknesses);
      setSuggestions(result.suggestions);
      setAtsBreakdown(null);
      setDetailed(null);
      setShowReanalyze(false);
      // Refresh history after re-analyze
      if (id) {
        getAnalysisHistory(id).then((h) => {
          setHistory(h.history || []);
          if (h.history?.length > 0) setActiveHistoryId(h.history[0].id);
        }).catch(() => {});
      }
      showToast('Re-analysis complete');
    } catch {
      showToast('Failed to re-analyze resume', 'error');
    } finally {
      setReanalyzeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-48 rounded bg-muted" />
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
          <h1 className="text-2xl font-bold text-foreground">Resume Analysis</h1>
          {targetRole && (
            <p className="text-sm text-muted-foreground">Target: {targetRole}</p>
          )}
          {jobDescription && (
            <p className="text-xs text-green-600 mt-0.5">Analyzed against job description</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowReanalyze((prev) => !prev);
            }}
            className="rounded-md border border-indigo-300 bg-card px-3 py-1.5 text-sm text-indigo-600 hover:bg-primary/5"
          >
            Re-analyze
          </button>
          <Link
            to="/dashboard"
            className="text-sm text-indigo-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {hasFile && (
        <div className="mb-4">
          <button
            onClick={() => setShowPdf((prev) => !prev)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-muted/50"
          >
            {showPdf ? 'Hide Original Resume ↑' : 'View Original Resume ↓'}
          </button>
          {showPdf && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border shadow-sm">
              <iframe
                src={`/api/resume/${id}/file`}
                title="Original Resume"
                width="100%"
                height="800px"
                className="block"
              />
            </div>
          )}
        </div>
      )}

      {showReanalyze && (
        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Re-analyze Resume</h2>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Target Role
            </label>
            <input
              type="text"
              value={reanalyzeRole}
              onChange={(e) => setReanalyzeRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowReanalyzeJd((prev) => !prev)}
              className="text-sm text-indigo-600 hover:underline focus:outline-none"
            >
              {showReanalyzeJd
                ? '− Hide job description'
                : '+ Add job description for better accuracy'}
            </button>
            {showReanalyzeJd && (
              <div className="mt-2">
                <textarea
                  rows={5}
                  maxLength={JD_MAX_LENGTH}
                  value={reanalyzeJd}
                  onChange={(e) => setReanalyzeJd(e.target.value)}
                  className="block w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Paste the job posting here…"
                />
                <p
                  className={`mt-1 text-right text-xs ${
                    reanalyzeJd.length >= JD_MAX_LENGTH ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                >
                  {reanalyzeJd.length}/{JD_MAX_LENGTH}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzeLoading || !reanalyzeRole.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reanalyzeLoading ? 'Analyzing…' : 'Run Analysis'}
            </button>
            <button
              type="button"
              onClick={() => setShowReanalyze(false)}
              className="text-sm text-muted-foreground hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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

        {history.length > 1 && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Analysis History</h2>
            <div className="space-y-2">
              {history.map((entry) => {
                const isActive = entry.id === activeHistoryId;
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setActiveHistoryId(entry.id);
                      setMatchPercentage(entry.match_percentage);
                      setStrengths(entry.ai_analysis?.strengths || []);
                      setWeaknesses(entry.ai_analysis?.weaknesses || []);
                      setSuggestions(entry.ai_analysis?.suggestions || []);
                      setAtsBreakdown(null);
                      setDetailed(null);
                    }}
                    className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                        {entry.target_role || 'Unknown role'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        entry.match_percentage >= 80
                          ? 'bg-green-100 text-green-700'
                          : entry.match_percentage >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {entry.match_percentage}%
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {entry.job_description && (
                        <span className="truncate max-w-xs">
                          JD: {entry.job_description.slice(0, 80)}{entry.job_description.length > 80 ? '…' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              if (resumeFormData) {
                await exportPdfWithTemplate(templateId, resumeFormData);
              } else {
                throw new Error('Resume data not available for export');
              }
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
