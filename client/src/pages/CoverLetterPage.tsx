import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { listResumes, apiClient } from '../utils/api';
import { useCoverLetters } from '../hooks/useCoverLetters';
import { useAuth } from '../hooks/useAuth';
import type { CoverLetter, CoverLetterTone, CoverLetterLength } from '../types';

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_DATA = {
  companyName: 'Stripe',
  jobTitle: 'Software Engineer, Payments Infrastructure',
  hiringManagerName: 'Alex Johnson',
  tone: 'professional' as CoverLetterTone,
  length: 'medium' as CoverLetterLength,
  jobDescription: `About the role
We are looking for a Software Engineer to join Stripe's Payments Infrastructure team. You will build and scale the core systems that power billions of dollars in transactions worldwide.

Responsibilities
- Design and implement reliable, high-throughput payment processing systems
- Collaborate with cross-functional teams across product, design, and operations
- Write clean, testable TypeScript/Go code with thorough documentation
- Participate in on-call rotations and incident response
- Drive technical design reviews and mentor junior engineers

Qualifications
- Bachelor's degree in Computer Science or equivalent practical experience
- 1–3 years of software engineering experience (internships count)
- Proficiency in at least one of: TypeScript, Go, Java, Python
- Understanding of distributed systems, APIs, and databases
- Strong communication skills and a bias toward action

Nice to have
- Experience with payment systems or financial technology
- Familiarity with AWS, Kubernetes, or similar infrastructure tooling
- Open-source contributions`,
};

// ─── SVG Icons (inline, no lucide-react dependency) ─────────────────────────

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Settings2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4M20 12H4M20 17H4" /><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="8" cy="17" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M5 18l.8 2.4L8 21l-2.2.6L5 24l-.8-2.4L2 21l2.2-.6z" /><path d="M19 2l.5 1.5L21 4l-1.5.5L19 6l-.5-1.5L17 4l1.5-.5z" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

const Wand2Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
    <path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FlaskConicalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.58 16.5h12.85" />
  </svg>
);


// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type StepStatus = 'pending' | 'active' | 'done';

interface ProgressStepRowProps {
  label: string;
  status: StepStatus;
  children?: React.ReactNode;
}

function ProgressStepRow({ label, status, children }: ProgressStepRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
          {status === 'done' && (
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'active' && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
          )}
          {status === 'pending' && (
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          )}
        </div>
        <span className={`text-sm font-medium ${
          status === 'done' ? 'text-green-600 dark:text-green-400'
          : status === 'active' ? 'text-teal-600 dark:text-teal-400'
          : 'text-gray-400'
        }`}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string; // Tailwind classes
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Accordion({ title, icon, accentColor, isOpen, onToggle, children }: AccordionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${isOpen ? 'border-b border-gray-100 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-700/30' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/20'}`}
      >
        <div className="flex items-center gap-2">
          <span className={accentColor}>{icon}</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        </div>
        <ChevronDownIcon open={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab bar (manual, no @radix-ui/react-tabs required) ──────────────────────

interface SimpleTabsProps {
  value: string;
  onChange: (v: string) => void;
  tabs: { value: string; label: string }[];
}

function SimpleTabs({ value, onChange, tabs }: SimpleTabsProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden text-xs font-medium">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex-1 px-3 py-1.5 transition-colors ${
            value === tab.value
              ? 'bg-teal-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── TipTap editor ────────────────────────────────────────────────────────────

interface EditorPanelProps {
  content: string;
  onChange: (html: string) => void;
}

function EditorPanel({ content, onChange }: EditorPanelProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror font-serif text-gray-800 dark:text-gray-100 leading-[1.8] text-[15px] p-10 md:p-16 min-h-[1056px] focus:outline-none',
      },
    },
  });

  // Sync content when activeLetter changes
  const prevContent = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== prevContent.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
    prevContent.current = content;
  }, [content, editor]);

  const btn = (active: boolean) =>
    `p-1.5 rounded text-xs transition-colors ${active
      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

  if (!editor) return null;

  return (
    <div className="group relative">
      {/* Floating toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 rounded-t-md border border-b-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btn(editor.isActive('bold'))}>
          <strong>B</strong>
        </button>
        <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btn(editor.isActive('italic'))}>
          <em>I</em>
        </button>
        <button type="button" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btn(editor.isActive('bulletList'))}>
          • ≡
        </button>
        <button type="button" title="Ordered list" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={btn(editor.isActive('orderedList'))}>
          1. ≡
        </button>
        <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-600" />
        <button type="button" title="Undo" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }} className={btn(false)}>
          ↩
        </button>
        <button type="button" title="Redo" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }} className={btn(false)}>
          ↪
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function CoverLetterPage() {
  const { user } = useAuth();

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const effectiveResumeId = selectedResumeId || null;

  const {
    coverLetters,
    activeLetter,
    mode,
    keywords,
    progressStep,
    isLoading,
    isSaving,
    savedIndicator,
    error,
    resumeInputMode,
    uploadedResumeText,
    uploadedFileName,
    isParsing,
    parseError,
    startNew,
    selectLetter,
    create,
    regenerate,
    save,
    remove,
    reset,
    setResumeInputMode,
    parseUploadedFile,
    improve,
  } = useCoverLetters(effectiveResumeId);

  // Form state
  const fullName = user?.name || '';
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [tone, setTone] = useState<CoverLetterTone>('professional');
  const [length, setLength] = useState<CoverLetterLength>('medium');

  // Improve section state
  const [whyThisCompany, setWhyThisCompany] = useState('');
  const [achievementToHighlight, setAchievementToHighlight] = useState('');
  const [showImproveConfirm, setShowImproveConfirm] = useState(false);

  // Accordion state
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [refineOpen, setRefineOpen] = useState(false);

  // Dialog state
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Editor state (plain text for revert + downloads)
  const [editorHtml, setEditorHtml] = useState('');
  const [copiedIndicator, setCopiedIndicator] = useState(false);

  // Drag-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch resume list
  useEffect(() => {
    listResumes()
      .then((data) => setResumes(data.resumes || []))
      .catch(() => {});
  }, []);

  // Sync editor content when active letter changes
  useEffect(() => {
    setEditorHtml(activeLetter?.content ?? '');
  }, [activeLetter?.id]);

  // Sync form fields when active letter changes
  useEffect(() => {
    if (activeLetter) {
      setCompanyName(activeLetter.company_name || '');
      setHiringManagerName(activeLetter.hiring_manager_name || '');
      setJobTitle(activeLetter.job_title || '');
      setTone(activeLetter.tone || 'professional');
      setLength(activeLetter.word_count_target || 'medium');
    }
  }, [activeLetter?.id]);

  // After generation: flip accordion state
  useEffect(() => {
    if (progressStep === 'done') {
      setSettingsOpen(false);
      setRefineOpen(true);
    }
  }, [progressStep]);

  const fillDemoData = () => {
    setCompanyName(DEMO_DATA.companyName);
    setJobTitle(DEMO_DATA.jobTitle);
    setHiringManagerName(DEMO_DATA.hiringManagerName);
    setJobDescription(DEMO_DATA.jobDescription);
    setTone(DEMO_DATA.tone);
    setLength(DEMO_DATA.length);
  };

  const buildPayload = useCallback(() => ({
    resumeId: resumeInputMode === 'existing' ? selectedResumeId : undefined,
    resumeText: resumeInputMode === 'upload' ? uploadedResumeText ?? undefined : undefined,
    fullName,
    targetRole: '',
    targetLocation: '',
    jobDescription,
    companyName,
    hiringManagerName: hiringManagerName || undefined,
    jobTitle: jobTitle || undefined,
    tone,
    wordCountTarget: length,
    matchedKeywords: [] as string[],
    missingKeywords: [] as string[],
  }), [resumeInputMode, selectedResumeId, uploadedResumeText, fullName, jobDescription, companyName, hiringManagerName, jobTitle, tone, length]);

  const handleGenerate = () => {
    if (mode === 'edit' && activeLetter && activeLetter.id) {
      setShowRegenConfirm(true);
    } else {
      create(buildPayload());
    }
  };

  const doRegenerate = () => {
    setShowRegenConfirm(false);
    if (activeLetter && activeLetter.id) {
      regenerate(activeLetter.id, buildPayload());
    }
  };

  const handleSave = () => {
    save(editorHtml);
  };

  const handleRevert = () => {
    if (activeLetter) {
      setEditorHtml(activeLetter.generated_content);
    }
  };

  const handleCopyText = async () => {
    const plainText = editorHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedIndicator(true);
      setTimeout(() => setCopiedIndicator(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadTxt = () => {
    if (!activeLetter) return;
    const plainText = editorHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName || 'download'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!activeLetter) return;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"></head>
<body><div style="font-family: Georgia, serif; font-size: 12pt; line-height: 1.8; padding: 48px; max-width: 800px; color: #1a1a1a;">${editorHtml}</div></body>
</html>`;
    try {
      const response = await apiClient.post('/export/pdf-from-html', { html }, {
        responseType: 'blob',
        timeout: 60000,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter-${companyName || 'download'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return;
    }
    await parseUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImprove = () => {
    if (!activeLetter?.id) return;
    const hasManualEdits = editorHtml !== (activeLetter.generated_content || activeLetter.content);
    if (hasManualEdits) {
      setShowImproveConfirm(true);
    } else {
      doImprove();
    }
  };

  const doImprove = () => {
    setShowImproveConfirm(false);
    if (!activeLetter?.id) return;
    improve(activeLetter.id, whyThisCompany || undefined, achievementToHighlight || undefined);
  };

  const isGenerating = ['extracting', 'keywords-ready', 'generating'].includes(progressStep);

  const canGenerate = (() => {
    if (isGenerating) return false;
    if (!jobDescription.trim() || !companyName.trim()) return false;
    if (resumeInputMode === 'existing') return Boolean(selectedResumeId);
    if (resumeInputMode === 'upload') return Boolean(uploadedResumeText);
    return false;
  })();

  const showRevert = activeLetter !== null && editorHtml !== activeLetter.generated_content;
  const showLetter =
    activeLetter !== null && (progressStep === 'idle' || progressStep === 'done') && !isGenerating;
  const showProgress = isGenerating;
  const showError = progressStep === 'error';
  const showEmpty = !showProgress && !showError && !showLetter && !isLoading;

  const allKeywords = [
    ...keywords.matched.map((kw) => ({ keyword: kw, matched: true })),
    ...keywords.missing.map((kw) => ({ keyword: kw, matched: false })),
  ];

  const step1Status: StepStatus =
    progressStep === 'extracting' ? 'active'
    : ['keywords-ready', 'generating', 'done'].includes(progressStep) ? 'done'
    : 'pending';
  const step2Status: StepStatus =
    progressStep === 'keywords-ready' ? 'active'
    : ['generating', 'done'].includes(progressStep) ? 'done'
    : 'pending';
  const step3Status: StepStatus =
    progressStep === 'generating' ? 'active'
    : progressStep === 'done' ? 'done'
    : 'pending';

  const tones: { value: CoverLetterTone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'formal', label: 'Formal' },
    { value: 'conversational', label: 'Conversational' },
  ];

  const lengths: { value: CoverLetterLength; label: string; desc: string }[] = [
    { value: 'short', label: 'Short', desc: '~150w' },
    { value: 'medium', label: 'Medium', desc: '~250w' },
    { value: 'long', label: 'Long', desc: '~400w' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">Regenerate cover letter?</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">This will replace the current letter with a new AI draft.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRegenConfirm(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={doRegenerate} className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Regenerate</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">Delete this cover letter?</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => { remove(confirmDeleteId!); setConfirmDeleteId(null); }} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showImproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">You have unsaved edits</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Improving will overwrite your manual edits. Your original AI draft will be the base for the improvement.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowImproveConfirm(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={doImprove} className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">Improve Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Page breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            <ChevronLeftIcon />
            <span>Dashboard</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">Cover Letters</span>
        </div>
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ─── Left panel — Accordion controls ────────────────────────── */}
          <aside className="custom-scrollbar overflow-y-auto lg:col-span-4 xl:col-span-3">
            <div className="space-y-3">

              {/* Accordion 1: Job & Style Settings */}
              <Accordion
                title="Job & Style Settings"
                icon={<Settings2Icon />}
                accentColor="text-teal-600 dark:text-teal-400"
                isOpen={settingsOpen}
                onToggle={() => setSettingsOpen((o) => !o)}
              >
                <div className="space-y-4">
                  {/* Fill demo data */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={fillDemoData}
                      className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-500 dark:hover:border-gray-400 dark:hover:text-gray-300"
                    >
                      <FlaskConicalIcon />
                      Fill demo data
                    </button>
                  </div>
                  {/* Section: Your Resume */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Your Resume</p>
                    <SimpleTabs
                      value={resumeInputMode}
                      onChange={(v) => setResumeInputMode(v as 'existing' | 'upload')}
                      tabs={[{ value: 'existing', label: 'Existing' }, { value: 'upload', label: 'Upload PDF' }]}
                    />
                    <div className="mt-3">
                      {resumeInputMode === 'existing' ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="">— choose a resume —</option>
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.target_role || 'Untitled'} — {r.target_country || ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          {/* Drag-drop zone */}
                          <div
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors ${
                              isDragging
                                ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                                : uploadedResumeText
                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-teal-500 dark:hover:bg-teal-900/10'
                            }`}
                          >
                            {isParsing ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                                <span className="text-xs text-gray-500">Parsing PDF...</span>
                              </div>
                            ) : uploadedResumeText ? (
                              <div className="flex flex-col items-center gap-1 text-center">
                                <span className="text-2xl">✓</span>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">Resume ready</span>
                                <span className="max-w-[160px] truncate text-xs text-gray-500">{uploadedFileName}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center">
                                <span className="text-gray-400 dark:text-gray-500"><UploadIcon /></span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Drop PDF here or click to browse</span>
                                <span className="text-xs text-gray-400">Max 5 MB</span>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                          />
                          {parseError && (
                            <p className="mt-1 text-xs text-red-600">{parseError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: The Job */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">The Job</p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={255}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Job Title</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Software Engineer (optional)"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Hiring Manager</label>
                        <input
                          type="text"
                          maxLength={255}
                          value={hiringManagerName}
                          onChange={(e) => setHiringManagerName(e.target.value)}
                          placeholder="Name (optional)"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Job Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={5}
                          maxLength={5000}
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                        <p className="mt-0.5 text-right text-xs text-gray-400">{jobDescription.length}/5000</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Style */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Style</p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Tone</label>
                        <div className="flex flex-wrap gap-1.5">
                          {tones.map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setTone(value)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                tone === value
                                  ? 'bg-teal-600 text-white'
                                  : 'border border-gray-300 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Length</label>
                        <div className="flex gap-1.5">
                          {lengths.map(({ value, label, desc }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setLength(value)}
                              className={`flex-1 rounded-lg border py-1.5 text-center text-xs font-medium transition-colors ${
                                length === value
                                  ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                  : 'border-gray-300 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div>{label}</div>
                              <div className="text-[10px] opacity-60">{desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full h-11 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    {isGenerating
                      ? 'Generating...'
                      : mode === 'edit' && activeLetter?.id
                      ? '↺ Regenerate'
                      : 'Generate Cover Letter'}
                  </button>
                </div>
              </Accordion>

              {/* Accordion 2: Refine with AI — only when saved letter exists */}
              {activeLetter && (
                <Accordion
                  title="Refine with AI"
                  icon={<SparklesIcon />}
                  accentColor="text-amber-500"
                  isOpen={refineOpen}
                  onToggle={() => setRefineOpen((o) => !o)}
                >
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Personalise the generated letter by adding your own story. AI will weave them in naturally.
                    </p>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Why this company?
                      </label>
                      <textarea
                        rows={3}
                        maxLength={300}
                        value={whyThisCompany}
                        onChange={(e) => setWhyThisCompany(e.target.value)}
                        placeholder="What excites you about this specific company..."
                        className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm dark:border-amber-700 dark:bg-gray-700 dark:text-gray-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                      />
                      <p className="mt-0.5 text-right text-xs text-gray-400">{whyThisCompany.length}/300</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Achievement to highlight
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        value={achievementToHighlight}
                        onChange={(e) => setAchievementToHighlight(e.target.value)}
                        placeholder="e.g. Grew user base 40% in 3 months..."
                        className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm dark:border-amber-700 dark:bg-gray-700 dark:text-gray-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <p className="mt-0.5 text-right text-xs text-gray-400">{achievementToHighlight.length}/200</p>
                    </div>
                    <button
                      onClick={handleImprove}
                      disabled={!whyThisCompany.trim() && !achievementToHighlight.trim()}
                      className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {progressStep === 'generating' ? 'Improving...' : 'Improve with AI'}
                    </button>
                  </div>
                </Accordion>
              )}

            </div>
          </aside>

          {/* ─── Right panel — Editor ───────────────────────────────────── */}
          <section className="flex flex-col overflow-hidden lg:col-span-8 xl:col-span-9">

            {/* Editor header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <span className="text-teal-600 dark:text-teal-400"><FileTextIcon /></span>
                Cover Letter Editor
              </div>
              <div className="flex items-center gap-2">
                {showLetter && (
                  <>
                    {showRevert && (
                      <button onClick={handleRevert} className="rounded-md px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">
                        Revert to AI original
                      </button>
                    )}
                    <button onClick={handleCopyText} className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                      <CopyIcon />
                      {copiedIndicator ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || editorHtml === activeLetter?.content}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savedIndicator ? 'Saved ✓' : isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Letters tab row */}
            {coverLetters.length > 0 && (
              <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={startNew}
                  className="flex-shrink-0 rounded-lg border border-dashed border-teal-400 px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                >
                  + New
                </button>
                {coverLetters.map((letter: CoverLetter) => (
                  <div
                    key={letter.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectLetter(letter)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectLetter(letter); }}
                    className={`relative flex-shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-left text-xs transition-colors ${
                      activeLetter?.id === letter.id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                        : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="max-w-[120px]">
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                          {letter.company_name || 'No company'}
                        </div>
                        <div className="truncate text-gray-400">
                          {letter.job_title || 'Cover Letter'}
                        </div>
                        <div className="text-gray-400">{formatRelativeDate(letter.updated_at)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(letter.id); }}
                        className="ml-1 rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Canvas */}
            <div className="custom-scrollbar relative flex-1 overflow-y-auto rounded-xl bg-gray-100/60 dark:bg-gray-900/40 p-4">

              {/* Loading */}
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                </div>
              )}

              {/* Empty state */}
              {!isLoading && showEmpty && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                    <span className="text-teal-500 dark:text-teal-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Ready to generate</h2>
                  <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">Fill in the settings on the left and click Generate</p>
                </div>
              )}

              {/* 3-step progress overlay */}
              {!isLoading && showProgress && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center px-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
                    <span className="animate-pulse text-teal-600 dark:text-teal-400"><Wand2Icon /></span>
                  </div>
                  <div className="w-full max-w-sm space-y-6">
                    <ProgressStepRow label="Scanning resume and job description" status={step1Status} />
                    <ProgressStepRow label="Analyzing keyword matches" status={step2Status}>
                      {progressStep === 'keywords-ready' && keywords.matched.length + keywords.missing.length > 0 && (
                        <div className="ml-10 flex flex-wrap gap-1.5">
                          {keywords.matched.slice(0, 6).map((kw) => (
                            <span key={kw} className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ {kw}</span>
                          ))}
                          {keywords.missing.slice(0, 6).map((kw) => (
                            <span key={kw} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">✗ {kw}</span>
                          ))}
                        </div>
                      )}
                    </ProgressStepRow>
                    <ProgressStepRow label="Writing your ATS-optimized cover letter" status={step3Status} />
                  </div>
                </div>
              )}

              {/* Error state */}
              {!isLoading && showError && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center px-8">
                  <div className="w-full max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                    <p className="mb-4 text-sm text-red-700 dark:text-red-400">{error}</p>
                    <button onClick={reset} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Try again</button>
                  </div>
                </div>
              )}

              {/* Letter content */}
              {!isLoading && showLetter && (
                <div>
                  {/* Paper document */}
                  <div className="mx-auto w-full max-w-3xl rounded-sm bg-white shadow-xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/5" style={{ minHeight: '1056px' }}>
                    <EditorPanel
                      content={editorHtml}
                      onChange={setEditorHtml}
                    />
                  </div>

                  {/* ATS Keyword Coverage */}
                  {allKeywords.length > 0 && (
                    <div className="mx-auto mt-6 w-full max-w-3xl">
                      <h3 className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">ATS Keyword Coverage</h3>
                      <div className="flex flex-wrap gap-2">
                        {allKeywords.map(({ keyword }) => {
                          const found = editorHtml.toLowerCase().includes(keyword.toLowerCase());
                          return (
                            <span
                              key={keyword}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                found
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              <span>{found ? '✅' : '❌'}</span>
                              {keyword}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Download bar */}
                  <div className="mx-auto mt-4 mb-8 flex w-full max-w-3xl items-center gap-3">
                    <button
                      onClick={handleDownloadPdf}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Download .txt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
