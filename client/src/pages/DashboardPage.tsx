import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, LayoutTemplate, Sparkles, PenLine, MoreHorizontal, FileText, Mail } from 'lucide-react';
import { ResumeSummary, CoverLetter } from '../types';
import { listResumes, deleteResume, listCoverLetters, deleteCoverLetter } from '../utils/api';
import { useToastContext } from '../contexts/ToastContext';
import { useAuthContext } from '../contexts/AuthContext';

// ── Wireframe Previews ────────────────────────────────────────────────────────

function ResumeWireframe() {
  return (
    <div className="w-full h-full bg-white dark:bg-neutral-900 p-3 flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        <div className="h-3 w-2/3 rounded bg-neutral-800 dark:bg-neutral-300" />
        <div className="h-2 w-1/2 rounded bg-neutral-300 dark:bg-neutral-600" />
        <div className="flex gap-2 mt-1">
          <div className="h-1.5 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
      {/* Two-column body */}
      <div className="flex gap-2 flex-1">
        {/* Left col */}
        <div className="w-1/3 flex flex-col gap-1.5">
          <div className="h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-1 h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-1 h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        {/* Right col */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-1 h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-1 h-1.5 w-2/3 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

function CoverLetterWireframe() {
  return (
    <div className="w-full h-full bg-white dark:bg-neutral-900 p-3 flex flex-col gap-2 overflow-hidden">
      {/* Date / address block */}
      <div className="flex flex-col gap-1 mb-1">
        <div className="h-1.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {/* Salutation */}
      <div className="h-1.5 w-2/5 rounded bg-neutral-300 dark:bg-neutral-600" />
      {/* Body paragraphs */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-1.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {/* Sign-off */}
      <div className="mt-2 flex flex-col gap-1">
        <div className="h-1.5 w-1/4 rounded bg-neutral-300 dark:bg-neutral-600" />
        <div className="h-1.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DocTab = 'all' | 'resumes' | 'cover_letters';

interface UnifiedDoc {
  id: string;
  type: 'resume' | 'cover_letter';
  title: string;
  subtitle: string;
  score: number | null;
  created_at: string;
}

// ── Document Card ─────────────────────────────────────────────────────────────

interface DocCardProps {
  doc: UnifiedDoc;
  onDelete: (id: string, type: 'resume' | 'cover_letter') => void;
}

function DocCard({ doc, onDelete }: DocCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const editHref = doc.type === 'resume'
    ? `/resume/${doc.id}`
    : `/cover-letter/new?id=${doc.id}`;

  const scoreColor = doc.score !== null
    ? (doc.score >= 80 ? 'text-emerald-600' : 'text-amber-500')
    : null;

  return (
    <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 flex flex-col gap-3">
      {/* Preview card */}
      <div className="relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden group aspect-[8.5/11]">
        {/* Wireframe */}
        <div className="absolute inset-0">
          {doc.type === 'resume' ? <ResumeWireframe /> : <CoverLetterWireframe />}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
          <Link
            to={editHref}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white text-neutral-900 rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:bg-neutral-100"
          >
            <PenLine className="w-4 h-4" />
            Edit
          </Link>
        </div>

        {/* Score badge — top left */}
        {doc.score !== null && (
          <div className="absolute top-2 left-2 bg-background/95 border border-border rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
            <span className={scoreColor ?? ''}>{doc.score}%</span>
          </div>
        )}

        {/* Type badge — top right (cover letters only) */}
        {doc.type === 'cover_letter' && (
          <div className="absolute top-2 right-2 bg-teal-500/10 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5 text-xs font-medium">
            Letter
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
          <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
        </div>

        {/* ⋯ menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`Menu for ${doc.title}`}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-xl border border-border bg-card shadow-lg py-1">
              <button
                onClick={() => { setMenuOpen(false); navigate(editHref); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground"
              >
                <PenLine className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(doc.id, doc.type); }}
                aria-label={`Delete ${doc.title}`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 flex flex-col gap-3">
      <div className="animate-pulse rounded-2xl border border-border bg-muted aspect-[8.5/11]" />
      <div className="animate-pulse space-y-1.5 px-1">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-2.5 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { showToast } = useToastContext();

  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<DocTab>('all');

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.name || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resumeData, clData] = await Promise.all([
          listResumes(),
          listCoverLetters().catch(() => ({ coverLetters: [] as CoverLetter[] })),
        ]);
        setResumes(resumeData.resumes);
        setCoverLetters(clData.coverLetters ?? []);
      } catch {
        setError('Failed to load your documents.');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleDelete = async (id: string, type: 'resume' | 'cover_letter') => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'resume' ? 'resume' : 'cover letter'}?`)) {
      return;
    }
    try {
      if (type === 'resume') {
        await deleteResume(id);
        setResumes((prev) => prev.filter((r) => r.id !== id));
        showToast('Resume deleted');
      } else {
        await deleteCoverLetter(id);
        setCoverLetters((prev) => prev.filter((c) => c.id !== id));
        showToast('Cover letter deleted');
      }
    } catch {
      showToast(`Failed to delete ${type === 'resume' ? 'resume' : 'cover letter'}`, 'error');
    }
  };

  // Build unified doc list
  const allDocs: UnifiedDoc[] = [
    ...resumes.map((r): UnifiedDoc => ({
      id: r.id,
      type: 'resume',
      title: r.target_role || 'Untitled Resume',
      subtitle: new Date(r.created_at).toLocaleDateString(),
      score: r.match_percentage ?? null,
      created_at: r.created_at,
    })),
    ...coverLetters.map((c): UnifiedDoc => ({
      id: c.id,
      type: 'cover_letter',
      title: c.job_title
        ? `${c.job_title}${c.company_name ? ` at ${c.company_name}` : ''}`
        : c.company_name || 'Cover Letter',
      subtitle: `${new Date(c.created_at).toLocaleDateString()}${c.company_name ? ` • ${c.company_name}` : ''}`,
      score: null,
      created_at: c.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredDocs = activeTab === 'all'
    ? allDocs
    : activeTab === 'resumes'
      ? allDocs.filter((d) => d.type === 'resume')
      : allDocs.filter((d) => d.type === 'cover_letter');

  const tabs: { key: DocTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'resumes', label: 'Resumes' },
    { key: 'cover_letters', label: 'Cover Letters' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 pt-6 sm:pt-10">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
            {greeting},{' '}
            <span className="text-primary">{displayName}</span>
          </h1>
          <p className="text-muted-foreground text-base">Let&apos;s land your next dream job.</p>
        </div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)] mb-12">

          {/* Box 1: Create New Resume */}
          <div className="col-span-12 lg:col-span-8 lg:row-span-2 relative rounded-3xl overflow-hidden group border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 min-h-[300px]">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            {/* Blurred orb */}
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary/30 transition-colors duration-300" />

            <div className="relative h-full flex flex-col justify-between p-8 sm:p-10">
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-lg mb-6">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  Create New Resume
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                  Use our AI-powered builder to craft a masterpiece that beats the ATS and stands out to recruiters.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  to="/build"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Building
                </Link>
              </div>
            </div>
          </div>

          {/* Box 2: Analyze PDF */}
          <Link
            to="/upload"
            className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-3xl border border-dashed border-border hover:border-primary/50 bg-muted/10 hover:bg-primary/5 flex flex-col items-center justify-center p-6 text-center group min-h-[180px] transition-all duration-200"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border shadow-sm text-muted-foreground group-hover:text-primary transition-colors mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1">Analyze PDF</h2>
            <p className="text-sm text-muted-foreground">Drop your existing resume to get an AI score</p>
          </Link>

          {/* Box 3: Cover Letters */}
          <Link
            to="/cover-letter/new"
            className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md flex flex-col justify-between group min-h-[180px] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <span className="bg-teal-500/10 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">Beta</span>
            </div>
            <div className="mt-4">
              <h2 className="text-base font-semibold text-foreground mb-1">Cover Letters</h2>
              <p className="text-sm text-muted-foreground">Generate tailored cover letters in seconds</p>
            </div>
          </Link>
        </div>

        {/* ── Recent Documents ── */}
        <div>
          {/* Section header + tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>

            <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50 backdrop-blur-sm w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.key
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-12 gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Empty state */}
          {!loading && !error && filteredDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                {activeTab === 'cover_letters'
                  ? <Mail className="w-5 h-5 text-muted-foreground" />
                  : <FileText className="w-5 h-5 text-muted-foreground" />
                }
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {activeTab === 'cover_letters'
                  ? 'No cover letters yet'
                  : activeTab === 'resumes'
                    ? 'No resumes yet'
                    : 'No documents yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'cover_letters'
                  ? <>Create one from the <Link to="/cover-letter/new" className="text-primary hover:underline">Cover Letters</Link> tool above.</>
                  : <>Upload one or build from scratch to get started.</>
                }
              </p>
            </div>
          )}

          {/* Document grid */}
          {!loading && !error && filteredDocs.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {filteredDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
