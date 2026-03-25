import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useBlocker, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Sparkles,
  FileText,
  Wand2,
  Copy,
  Download,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Plus,
  Maximize,
  Minimize,
  Upload,
  RefreshCw,
  Edit3,
  ChevronDown,
  AlignLeft,
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DEFAULT_TEMPLATE_ID, type CoverLetterTemplateId } from '../components/cover-letter/coverLetterTemplates';
import ConfirmLeaveModal from '../components/shared/ConfirmLeaveModal';
import CoverLetterTemplatePicker from '../components/cover-letter/CoverLetterTemplatePicker';
import BoldArchitectTemplate from '../components/cover-letter/BoldArchitectTemplate';
import { listResumes, apiClient, getResume } from '../utils/api';
import { useCoverLetters } from '../hooks/useCoverLetters';
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../contexts/ToastContext';
import type { CoverLetter, CoverLetterTone, CoverLetterLength, ResumeFormData } from '../types';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { TemplateId } from '../components/templates/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function ProgressStepRow({ label, status, children }: { label: string; status: StepStatus; children?: React.ReactNode }) {
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

// ─── Formatting toolbar (rendered above the paper, outside EditorPanel) ────────

function FormatToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `p-1.5 rounded text-xs transition-colors ${active
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted/60'}`;
  return (
    <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-border/50 bg-background shrink-0">
      <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btn(editor.isActive('bold'))}>
        <strong className="text-xs">B</strong>
      </button>
      <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btn(editor.isActive('italic'))}>
        <em className="text-xs">I</em>
      </button>
      <button type="button" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btn(editor.isActive('bulletList'))}>
        <span className="text-xs">• ≡</span>
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button type="button" title="Undo" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }} className={btn(false)}>
        <span className="text-xs">↩</span>
      </button>
      <button type="button" title="Redo" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }} className={btn(false)}>
        <span className="text-xs">↪</span>
      </button>
    </div>
  );
}

// ─── TipTap editor ────────────────────────────────────────────────────────────

function EditorPanel({ content, onChange, onEditorReady }: {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
}) {
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
        class: 'ProseMirror font-serif text-gray-800 leading-[1.8] text-[15px] focus:outline-none',
      },
    },
  });

  // Notify parent when editor instance is ready or destroyed
  useEffect(() => {
    onEditorReady?.(editor ?? null);
    return () => { onEditorReady?.(null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const prevContent = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== prevContent.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
    prevContent.current = content;
  }, [content, editor]);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

// ─── Step 1: Resume Selection ─────────────────────────────────────────────────

interface SelectionStepProps {
  resumes: any[];
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
  resumeInputMode: 'existing' | 'upload';
  setResumeInputMode: (mode: 'existing' | 'upload') => void;
  uploadedFileName: string | null;
  isParsing: boolean;
  parseError: string | null;
  parseUploadedFile: (file: File) => Promise<void>;
  onContinue: () => void;
}

function SelectionStep({
  resumes,
  selectedResumeId,
  setSelectedResumeId,
  resumeInputMode,
  setResumeInputMode,
  uploadedFileName,
  isParsing,
  parseError,
  parseUploadedFile,
  onContinue,
}: SelectionStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue =
    (resumeInputMode === 'existing' && Boolean(selectedResumeId)) ||
    (resumeInputMode === 'upload' && Boolean(uploadedFileName));

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return;
    await parseUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 h-[72px] border-b border-border/50 px-8 flex items-center">
        <Link
          to="/"
          className="text-base font-bold tracking-tight text-foreground hover:text-teal-600 transition-colors"
        >
          ProResumeAI
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 mb-4">
              <FileText className="text-teal-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Create a Cover Letter</h1>
            <p className="text-muted-foreground text-sm">Choose a resume to base your letter on</p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setResumeInputMode('existing')}
              className={`flex-1 px-4 py-2.5 transition-colors ${
                resumeInputMode === 'existing'
                  ? 'bg-teal-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Use Existing Resume
            </button>
            <button
              type="button"
              onClick={() => setResumeInputMode('upload')}
              className={`flex-1 px-4 py-2.5 transition-colors ${
                resumeInputMode === 'upload'
                  ? 'bg-teal-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Upload PDF
            </button>
          </div>

          {/* Existing resume select */}
          {resumeInputMode === 'existing' && (
            <div className="mb-6">
              {resumes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No resumes found.{' '}
                  <Link to="/build" className="text-teal-600 hover:underline">Create one</Link> first.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.title || r.target_role || 'Untitled Resume'} — {formatRelativeDate(r.created_at)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Upload zone */}
          {resumeInputMode === 'upload' && (
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-teal-500 bg-teal-500/5'
                    : 'border-border hover:border-teal-400 hover:bg-muted/30'
                }`}
              >
                {isParsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                    <p className="text-sm text-muted-foreground">Parsing PDF...</p>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="text-green-500" size={32} />
                    <p className="text-sm font-medium text-foreground">{uploadedFileName}</p>
                    <p className="text-xs text-muted-foreground">Click to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="text-muted-foreground/50" size={32} />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Drop your PDF here</p>
                      <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
              {parseError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {parseError}
                </p>
              )}
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full h-11 rounded-xl bg-teal-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
        `
      }} />
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<'select-resume' | 'editor'>('select-resume');

  // Block navigation while in editor (unsaved cover letter)
  const blocker = useBlocker(step === 'editor');

  useEffect(() => {
    if (step !== 'editor') return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const effectiveResumeId = step === 'editor' ? (selectedResumeId || null) : null;

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
    uploadedResumeId,
    uploadedResumeFilePath,
    isParsing,
    parseError,
    extractedContactInfo,
    startNew,
    selectLetter,
    loadLetter,
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
  const [customInstructions, setCustomInstructions] = useState('');

  // UI state
  const [isLeftJDExpanded, setIsLeftJDExpanded] = useState(false);
  const [showRefinePanel, setShowRefinePanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [resumeContactInfo, setResumeContactInfo] = useState<{ email: string; phone: string; address: string }>({ email: '', phone: '', address: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateId>(DEFAULT_TEMPLATE_ID);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const isImprovingRef = useRef(false);
  const [whyThisCompany, setWhyThisCompany] = useState('');
  const [achievementToHighlight, setAchievementToHighlight] = useState('');
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showImproveConfirm, setShowImproveConfirm] = useState(false);

  // Resume preview toggle
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumePreviewData, setResumePreviewData] = useState<{ formData: ResumeFormData; templateId: string } | null>(null);
  const [isLoadingResumePreview, setIsLoadingResumePreview] = useState(false);

  // Editor state
  const [editorHtml, setEditorHtml] = useState('');
  const [copiedIndicator, setCopiedIndicator] = useState(false);

  // Fetch resume list on mount
  useEffect(() => {
    listResumes()
      .then((data) => setResumes(data.resumes || []))
      .catch(() => {});
  }, []);

  // Fetch resume contact info when resume selection changes
  useEffect(() => {
    if (!selectedResumeId) { setResumeContactInfo({ email: '', phone: '', address: '' }); return; }
    getResume(selectedResumeId)
      .then((r) => {
        const fd = r.form_data ?? {};
        const addr = [fd.city, fd.country].filter(Boolean).join(', ');
        setResumeContactInfo({ email: fd.email ?? '', phone: fd.phone ?? '', address: addr });
      })
      .catch(() => {});
  }, [selectedResumeId]);

  // When AI extraction returns contact info (upload mode), fill in any missing fields
  useEffect(() => {
    if (!extractedContactInfo) return;
    setResumeContactInfo(prev => ({
      email: prev.email || extractedContactInfo.email || '',
      phone: prev.phone || extractedContactInfo.phone || '',
      address: prev.address || [extractedContactInfo.city, extractedContactInfo.country].filter(Boolean).join(', '),
    }));
  }, [extractedContactInfo]);

  // Reset built-resume preview data when a different resume is selected
  useEffect(() => {
    setResumePreviewData(null);
  }, [selectedResumeId]);

  // Deep-link: ?id=<cover_letter_id> — jump straight to editor with that letter loaded
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    setStep('editor');
    loadLetter(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-link: ?resume_id=<resume_id> — pre-select resume and jump to editor
  useEffect(() => {
    const resumeId = searchParams.get('resume_id');
    if (!resumeId) return;
    setSelectedResumeId(resumeId);
    setResumeInputMode('existing');
    setStep('editor');
    setShowResumePreview(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync editor content when active letter changes or content is updated (improve/regenerate/save)
  useEffect(() => {
    setEditorHtml(activeLetter?.content ?? '');
  }, [activeLetter?.id, activeLetter?.content]);

  // Sync form fields when active letter changes
  useEffect(() => {
    if (activeLetter) {
      setCompanyName(activeLetter.company_name || '');
      setHiringManagerName(activeLetter.hiring_manager_name || '');
      setJobTitle(activeLetter.job_title || '');
      setJobDescription(activeLetter.job_description ?? '');
      setTone(activeLetter.tone || 'professional');
      setLength(activeLetter.word_count_target || 'medium');
    }
  }, [activeLetter?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a PDF is uploaded in cover letter mode, sync its ID to selectedResumeId
  // and auto-advance to editor — no need to click Continue manually
  useEffect(() => {
    if (resumeInputMode === 'upload' && uploadedResumeId) {
      setSelectedResumeId(uploadedResumeId);
      setStep('editor');
    }
  }, [uploadedResumeId, resumeInputMode]);

  // Auto-close refine panel on successful improve (keep open on error so user can retry)
  useEffect(() => {
    if (!isImprovingRef.current) return;
    if (progressStep === 'done') {
      isImprovingRef.current = false;
      setShowRefinePanel(false);
    } else if (progressStep === 'error') {
      isImprovingRef.current = false;
    }
  }, [progressStep]);

  // Determine the file_path for the currently selected resume (for preview toggle)
  const selectedResumeFilePath: string | null =
    resumes.find((r: any) => r.id === selectedResumeId)?.file_path ||
    (resumeInputMode === 'upload' ? uploadedResumeFilePath : null) ||
    null;

  // Fetch built resume template data when preview is opened (no file_path = built resume)
  useEffect(() => {
    if (!showResumePreview || selectedResumeFilePath || !selectedResumeId || resumePreviewData) return;
    setIsLoadingResumePreview(true);
    getResume(selectedResumeId)
      .then((data) => {
        const resume = data.resume ?? data;
        if (resume?.form_data && resume?.template_id) {
          setResumePreviewData({ formData: resume.form_data as ResumeFormData, templateId: resume.template_id });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingResumePreview(false));
  }, [showResumePreview, selectedResumeId, selectedResumeFilePath, resumePreviewData]);

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
      create(buildPayload()).then((result) => {
        if (result?.resumeSaved) {
          showToast('Resume saved to your library', 'success');
        }
      });
    }
  };

  const doRegenerate = () => {
    setShowRegenConfirm(false);
    if (activeLetter && activeLetter.id) {
      regenerate(activeLetter.id, buildPayload());
    }
  };

  const handleSave = () => save(editorHtml);

  const buildFullPlainText = () => {
    const dateString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const bodyText = editorHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const lines: string[] = [];
    if (fullName) lines.push(fullName);
    if (jobTitle) lines.push(jobTitle);
    const contact = [resumeContactInfo.email, resumeContactInfo.phone, resumeContactInfo.address].filter(Boolean).join(' | ');
    if (contact) lines.push(contact);
    lines.push('');
    lines.push(dateString);
    lines.push('');
    if (hiringManagerName) lines.push(hiringManagerName);
    if (companyName) lines.push(companyName);
    lines.push('');
    lines.push(bodyText);
    return lines.join('\n');
  };

  const buildFullPdfHtml = () => {
    const dateString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const recipientBlock = [
      hiringManagerName ? `<strong>${hiringManagerName}</strong>` : '',
      companyName ? `<span>${companyName}</span>` : '',
    ].filter(Boolean).join('<br/>');

    let headerHtml: string;
    if (selectedTemplate === 'bold_architect') {
      const contact = [resumeContactInfo.email, resumeContactInfo.phone, resumeContactInfo.address].filter(Boolean).join(' &nbsp;&middot;&nbsp; ');
      headerHtml = `
        <h1 style="font-size:48px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;text-align:center;margin:0 0 16px;">${jobTitle || ''}</h1>
        ${contact ? `<p style="text-align:center;font-size:13px;color:#444;margin:0 0 24px;">${contact}</p>` : ''}
        <hr style="border:none;border-top:2px solid #111;margin-bottom:40px;"/>
      `;
    } else {
      const contact = [resumeContactInfo.email, resumeContactInfo.phone, resumeContactInfo.address].filter(Boolean).join(' &middot; ');
      headerHtml = `
        ${fullName ? `<h1 style="font-size:22px;font-weight:bold;margin:0 0 4px;">${fullName}</h1>` : ''}
        ${jobTitle ? `<p style="font-size:13px;color:#555;margin:0 0 6px;">${jobTitle}</p>` : ''}
        ${contact ? `<p style="font-size:12px;color:#666;margin:0 0 16px;">${contact}</p>` : ''}
        <hr style="border:none;border-top:1px solid #d1d5db;margin-bottom:24px;"/>
      `;
    }

    const font = selectedTemplate === 'bold_architect'
      ? 'system-ui, Arial, sans-serif'
      : 'Georgia, serif';

    const body = `
      <div style="font-family:${font};font-size:15px;line-height:1.7;padding:72px 80px;color:#111;background:white;max-width:900px;">
        ${headerHtml}
        <p style="margin-bottom:24px;">${dateString}</p>
        ${recipientBlock ? `<div style="margin-bottom:24px;">${recipientBlock}</div>` : ''}
        <div style="font-size:15px;line-height:1.7;">${editorHtml}</div>
      </div>
    `;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>body{margin:0}p{margin:0 0 16px}ul{margin:0 0 16px;padding-left:24px}li{margin-bottom:4px}</style></head><body>${body}</body></html>`;
  };

  const handleCopyText = async () => {
    const plainText = buildFullPlainText();
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedIndicator(true);
      setTimeout(() => setCopiedIndicator(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownloadTxt = () => {
    if (!activeLetter) return;
    const plainText = buildFullPlainText();
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
    const html = buildFullPdfHtml();
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
    } catch { /* silently fail */ }
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
    isImprovingRef.current = true;
    improve(activeLetter.id, whyThisCompany || undefined, achievementToHighlight || undefined);
  };

  const isGenerating = ['extracting', 'keywords-ready', 'generating'].includes(progressStep);

  const canGenerate = (() => {
    if (isGenerating) return false;
    if (!jobDescription.trim() || !companyName.trim()) return false;
    if (resumeInputMode === 'existing') return Boolean(selectedResumeId);
    if (resumeInputMode === 'upload') return Boolean(uploadedResumeId);
    return false;
  })();

  const showLetter = activeLetter !== null && (progressStep === 'idle' || progressStep === 'done') && !isGenerating;
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

  const fillDemo = () => {
    setCompanyName('Google');
    setJobTitle('Software Engineer');
    setHiringManagerName('Sarah Chen');
    setJobDescription(`We are looking for a Software Engineer to join our team at Google.

Requirements:
- 2+ years of experience with React, TypeScript, and Node.js
- Strong understanding of REST APIs and system design
- Experience with cloud platforms (GCP, AWS, or Azure)
- Excellent problem-solving and communication skills
- Familiarity with agile development practices

Nice to have:
- Experience with GraphQL
- Open source contributions
- Knowledge of machine learning fundamentals`);
    setTone('enthusiastic');
    setLength('medium');
  };

  const handleNewCoverLetter = () => {
    startNew();
    setCompanyName('');
    setJobTitle('');
    setHiringManagerName('');
    setJobDescription('');
    setTone('professional');
    setLength('medium');
    setCustomInstructions('');
    setIsLeftJDExpanded(false);
  };

  const getLetterTabLabel = (letter: CoverLetter, idx: number) =>
    letter.company_name || letter.job_title || `Letter ${idx + 1}`;

  // ─── Step 1: Resume selection screen ────────────────────────────────────────

  if (step === 'select-resume') {
    return (
      <SelectionStep
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        setSelectedResumeId={setSelectedResumeId}
        resumeInputMode={resumeInputMode}
        setResumeInputMode={setResumeInputMode}
        uploadedFileName={uploadedFileName}
        isParsing={isParsing}
        parseError={parseError}
        parseUploadedFile={parseUploadedFile}
        onContinue={() => setStep('editor')}
      />
    );
  }

  // ─── Step 2: Two-column editor ───────────────────────────────────────────────

  return (
    <>
      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
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

      {/* ── Main editor layout ──────────────────────────────────────────────── */}
      <div className="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
        <main className="flex-1 w-full min-h-0 relative">
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full">

            {/* ═══════════════════════════════════════════════════════════════
                LEFT COLUMN — JOB SETTINGS (40%)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0 overflow-hidden relative pl-4 sm:pl-8 lg:pl-12 pr-6 pt-4 pb-4 border-r border-border/50 bg-background">

              {/* Left header */}
              <div className="shrink-0 h-[72px] flex items-center border-b border-border/50">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-base font-bold tracking-tight text-foreground hover:text-teal-600 transition-colors"
                >
                  ProResumeAI
                </button>
              </div>

              {/* ── Resume Preview (replaces Job Settings when active) ─── */}
              {showResumePreview && selectedResumeId && (selectedResumeFilePath || resumePreviewData || isLoadingResumePreview) ? (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between py-2 border-b border-border/50 shrink-0">
                    <span className="text-sm font-semibold text-foreground">Resume Preview</span>
                    <button
                      type="button"
                      onClick={() => setShowResumePreview(false)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <EyeOff size={12} /> Hide
                    </button>
                  </div>
                  {selectedResumeFilePath ? (
                    <iframe
                      src={`/api/resume/${selectedResumeId}/file`}
                      className="flex-1 w-full border-0"
                      title="Resume Preview"
                    />
                  ) : isLoadingResumePreview ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : resumePreviewData ? (
                    <div className="flex-1 overflow-auto bg-neutral-100 p-4">
                      <ResumeTemplateSwitcher
                        templateId={resumePreviewData.templateId as TemplateId}
                        data={resumePreviewData.formData}
                        isPreview={true}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
              <>

              {/* Expanded JD view */}
              {isLeftJDExpanded ? (
                <div className="flex flex-col flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-200 pt-6">
                  <div className="flex items-center justify-between mb-4 shrink-0 bg-teal-50 dark:bg-teal-900/10 p-3 border-y border-teal-100 dark:border-teal-900/50 mx-[-24px] px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <FileText size={16} />
                      </div>
                      <h2 className="text-lg font-bold text-teal-900 dark:text-teal-100">Job Target Data</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLeftJDExpanded(false)}
                      className="flex items-center gap-1.5 text-xs font-semibold border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 transition-colors"
                    >
                      <Minimize size={14} /> Collapse
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
                    <div className="grid grid-cols-2 gap-3 shrink-0">
                      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Company</p>
                        <input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Company Name"
                          className="w-full h-8 text-sm bg-transparent border-none outline-none font-semibold placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Role</p>
                        <input
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Job Title"
                          className="w-full h-8 text-sm bg-transparent border-none outline-none font-semibold placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col relative min-h-[300px]">
                      <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Full Job Description</p>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="flex-1 bg-background resize-none text-sm leading-relaxed p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className="w-full h-11 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 mt-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Compact view */
                <div className="flex-1 overflow-y-auto px-0 pt-6 custom-scrollbar pb-24 animate-in fade-in duration-300">
                  <div className="mb-6 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Job Settings</h2>
                      <p className="text-muted-foreground text-xs">Tell us about the role to generate your letter.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedResumeId && (
                        <button
                          type="button"
                          onClick={() => setShowResumePreview(true)}
                          className="text-amber-600 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                        >
                          <Eye size={12} /> Resume
                        </button>
                      )}
                      {false && (
                        <button
                          type="button"
                          onClick={fillDemo}
                          className="text-violet-600 hover:text-violet-700 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                        >
                          <Wand2 size={12} /> Demo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsLeftJDExpanded(true)}
                        className="text-teal-600 hover:text-teal-700 bg-teal-500/10 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                      >
                        <Maximize size={14} /> Expand
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Company */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Company Name</label>
                      <input
                        placeholder="e.g. Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-10 text-sm px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Job Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Job Title</label>
                      <input
                        placeholder="e.g. Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full h-10 text-sm px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Hiring Manager */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Hiring Manager <span className="font-normal text-muted-foreground">(optional)</span></label>
                      <input
                        placeholder="e.g. Jane Smith"
                        value={hiringManagerName}
                        onChange={(e) => setHiringManagerName(e.target.value)}
                        className="w-full h-10 text-sm px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/30 placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Job Description with expand toggle */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground/80">Job Description</label>
                        <button
                          type="button"
                          onClick={() => setIsLeftJDExpanded(true)}
                          className="text-teal-600 hover:text-teal-700 text-xs flex items-center gap-1"
                        >
                          <Maximize size={12} /> Full view
                        </button>
                      </div>
                      <textarea
                        placeholder="Paste the key requirements..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-teal-500/30 p-3 placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Tone pills */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/80">Tone</label>
                      <div className="flex flex-wrap gap-2">
                        {tones.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setTone(t.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              tone === t.value
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-background text-muted-foreground border-border hover:border-teal-400 hover:text-teal-600'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Length radio */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/80">Length</label>
                      <div className="flex gap-2">
                        {lengths.map((l) => (
                          <button
                            key={l.value}
                            type="button"
                            onClick={() => setLength(l.value)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                              length === l.value
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-background text-muted-foreground border-border hover:border-teal-400'
                            }`}
                          >
                            <div>{l.label}</div>
                            <div className="text-[10px] opacity-70 mt-0.5">{l.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom instructions */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground/80">Custom Instructions <span className="font-normal text-muted-foreground">(optional)</span></label>
                        <span className="text-[10px] text-muted-foreground">{customInstructions.length}/500</span>
                      </div>
                      <textarea
                        placeholder="Any additional guidance for the AI..."
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        maxLength={500}
                        className="w-full bg-background border border-border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-teal-500/30 p-3 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sticky generate button (compact view only) */}
              {!isLeftJDExpanded && (
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-4 bg-gradient-to-t from-background via-background to-transparent">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full h-11 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    {isGenerating ? 'Analyzing...' : 'Generate Cover Letter'}
                  </button>
                </div>
              )}
              </>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                RIGHT COLUMN — EDITOR CANVAS (60%)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-muted/10 border-l border-border/50">
              <div className="bg-background flex-1 flex flex-col relative min-h-0 overflow-hidden">

                {/* Right header */}
                <div className="px-4 sm:px-6 pr-4 sm:pr-8 lg:pr-12 h-[72px] border-b border-border/50 bg-background flex items-center justify-between gap-3 z-20 relative shrink-0">
                  {/* Left: Active letter context */}
                  <div className="flex items-center gap-2 min-w-0">
                    {activeLetter && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {activeLetter.company_name || activeLetter.job_title || 'Cover Letter'}
                        </span>
                        {activeLetter.company_name && activeLetter.job_title && (
                          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                            — {activeLetter.job_title}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {activeLetter && (
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowRefinePanel(!showRefinePanel)}
                        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm border transition-colors shrink-0 ${
                          showRefinePanel
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800'
                            : 'text-amber-600 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                        }`}
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="hidden xl:inline">Refine with AI</span>
                        <span className="xl:hidden">Refine</span>
                      </button>
                      <div className="w-px h-5 bg-border mx-1 shrink-0 hidden sm:block" />
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm border border-border hover:bg-muted/50 transition-colors shrink-0"
                      >
                        <Copy size={14} />
                        <span>{copiedIndicator ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors shrink-0 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        {savedIndicator ? 'Saved ✓' : 'Save'}
                      </button>
                      <div className="relative" ref={exportMenuRef}>
                        <button
                          type="button"
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm border border-border hover:bg-muted/50 transition-colors shrink-0"
                        >
                          <Download size={14} />
                          <span className="hidden sm:inline">Export</span>
                          <ChevronDown size={12} className="text-muted-foreground" />
                        </button>
                        {showExportMenu && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-background text-foreground border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => { handleDownloadPdf(); setShowExportMenu(false); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                            >
                              <FileText size={13} />
                              Download PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => { handleDownloadTxt(); setShowExportMenu(false); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-t border-border/50"
                            >
                              <AlignLeft size={13} />
                              Download TXT
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Document tab bar */}
                <div className="bg-background border-b border-border/50 px-4 sm:px-6 py-2 flex items-center shrink-0 z-10 overflow-x-auto no-scrollbar shadow-sm gap-2">
                  <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 shadow-inner flex-nowrap w-fit">
                    {coverLetters.map((letter, idx) => (
                      <button
                        key={letter.id}
                        onClick={() => selectLetter(letter)}
                        className={`group relative px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all max-w-[150px] truncate shrink-0 flex items-center gap-1.5 ${
                          activeLetter?.id === letter.id
                            ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm border border-border/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50 border border-transparent'
                        }`}
                      >
                        <span className="truncate">{getLetterTabLabel(letter, idx)}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(letter.id); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setConfirmDeleteId(letter.id); } }}
                          className="opacity-0 group-hover:opacity-100 ml-1 rounded text-muted-foreground hover:text-red-500 transition-opacity shrink-0"
                        >
                          <X size={12} />
                        </span>
                      </button>
                    ))}

                    <AnimatePresence>
                      {mode === 'new' && coverLetters.length > 0 && (
                        <motion.div
                          key="draft-tab"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium border border-dashed border-teal-400 bg-teal-500/10 text-teal-700 dark:text-teal-400 shrink-0"
                        >
                          <Edit3 size={12} />
                          New Draft
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {coverLetters.length > 0 && (
                    <button
                      type="button"
                      onClick={handleNewCoverLetter}
                      title="New letter"
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-dashed border-border text-muted-foreground hover:border-teal-400 hover:text-teal-600 transition-colors shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <div className="ml-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTemplatePicker(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/50 hover:border-border transition-colors"
                    >
                      <Palette size={13} />
                      Templates
                    </button>
                  </div>
                </div>

                {/* Formatting toolbar — above paper, below tab bar */}
                <FormatToolbar editor={activeEditor} />

                {/* Editor canvas */}
                <div className="flex-1 flex overflow-hidden relative bg-muted/10">
                  <div className="flex-1 overflow-y-auto relative flex flex-col items-center custom-scrollbar w-full">

                    {/* Loading spinner */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-teal-600" size={32} />
                      </div>
                    )}

                    {/* Generating overlay */}
                    {showProgress && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 px-8">
                        <div className="relative w-20 h-20 mb-8">
                          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                          <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-600 animate-pulse" size={28} />
                        </div>
                        <h3 className="text-xl font-bold mb-6">Crafting your letter...</h3>
                        <div className="w-full max-w-xs space-y-4">
                          <ProgressStepRow label="Extracting keywords from JD" status={step1Status}>
                            {step2Status === 'done' || step2Status === 'active' ? (
                              <div className="ml-10 flex flex-wrap gap-1.5">
                                {keywords.matched.slice(0, 5).map((kw) => (
                                  <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">✓ {kw}</span>
                                ))}
                                {keywords.missing.slice(0, 3).map((kw) => (
                                  <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">✗ {kw}</span>
                                ))}
                              </div>
                            ) : null}
                          </ProgressStepRow>
                          <ProgressStepRow label="Matching to your resume" status={step2Status} />
                          <ProgressStepRow label="Writing your cover letter" status={step3Status} />
                        </div>
                      </div>
                    )}

                    {/* Error state */}
                    {showError && (
                      <div className="w-full max-w-md mt-16 mx-4">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                            <div>
                              <h3 className="font-semibold text-red-800 mb-1">Generation failed</h3>
                              <p className="text-sm text-red-700">{error}</p>
                              <button
                                type="button"
                                onClick={reset}
                                className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                              >
                                <RefreshCw size={14} /> Try Again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {showEmpty && !isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <FileText size={80} strokeWidth={1} />
                          <p className="text-sm">Fill in the form and generate your letter</p>
                        </div>
                      </div>
                    )}

                    {/* Paper document */}
                    {showLetter && selectedTemplate === 'bold_architect' && (
                      <div className="w-full max-w-[850px] flex flex-col z-10 pb-16 px-4 md:px-8 py-8">
                        <BoldArchitectTemplate
                          fullName={fullName}
                          jobTitle={jobTitle}
                          email={resumeContactInfo.email}
                          phone={resumeContactInfo.phone}
                          address={resumeContactInfo.address}
                          hiringManagerName={hiringManagerName}
                          companyName={companyName}
                          editorHtml={editorHtml}
                          allKeywords={allKeywords}
                          onEditorChange={setEditorHtml}
                          onEditorReady={setActiveEditor}
                          EditorPanel={EditorPanel}
                        />
                      </div>
                    )}

                    {showLetter && selectedTemplate !== 'bold_architect' && (
                      <div className="w-full max-w-[850px] flex flex-col z-10 pb-16 px-4 md:px-8 py-8">
                        <div className="bg-white text-black shadow-xl ring-1 ring-black/5 rounded-sm flex flex-col min-h-[1056px] pt-[72px] pb-[72px] px-[80px] font-sans text-[15px] leading-relaxed relative">

                          {/* Header */}
                          <div className="flex flex-col items-start mb-8 w-full border-b border-gray-300 pb-6">
                            <h1 className="text-4xl tracking-tight mb-2 font-bold text-gray-900">{fullName || 'Your Name'}</h1>
                            <h2 className="text-xl text-gray-600 mb-4">{jobTitle || 'Job Title'}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                              {resumeContactInfo.email && <span>{resumeContactInfo.email}</span>}
                              {resumeContactInfo.email && resumeContactInfo.phone && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
                              {resumeContactInfo.phone && <span>{resumeContactInfo.phone}</span>}
                              {resumeContactInfo.address && (resumeContactInfo.email || resumeContactInfo.phone) && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
                              {resumeContactInfo.address && <span>{resumeContactInfo.address}</span>}
                            </div>
                          </div>

                          {/* Recipient info */}
                          <div className="mb-8 text-[15px] text-gray-800">
                            <div className="mb-6 font-semibold">
                              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            {(hiringManagerName || companyName) && (
                              <div className="flex flex-col gap-0.5">
                                {hiringManagerName && <span className="font-semibold">{hiringManagerName}</span>}
                                {companyName && <span>{companyName}</span>}
                              </div>
                            )}
                          </div>

                          {/* Body — TipTap editor */}
                          <div className="flex-1">
                            <EditorPanel content={editorHtml} onChange={setEditorHtml} onEditorReady={setActiveEditor} />
                          </div>

                          {/* Footer: word count + keyword badges */}
                          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {editorHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} words
                            </span>
                            {allKeywords.slice(0, 8).map(({ keyword, matched }) => (
                              <span
                                key={keyword}
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${matched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                              >
                                {matched ? '✓' : '✗'} {keyword}
                              </span>
                            ))}
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* ─── Cover Letter Template Picker ────────────────────────────────────── */}
        {showTemplatePicker && (
          <CoverLetterTemplatePicker
            selected={selectedTemplate}
            onSelect={setSelectedTemplate}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}

        {/* ─── Floating Refine with AI panel ──────────────────────────────────── */}
        <AnimatePresence>
          {showRefinePanel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              drag
              dragMomentum={false}
              dragConstraints={{ top: -800, left: -1000, right: 0, bottom: 0 }}
              className="fixed bottom-10 right-10 z-[99999] w-full max-w-[380px] bg-card border border-amber-200/50 dark:border-amber-900/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
              style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
            >
              {/* Panel header (draggable handle) */}
              <div className="p-4 border-b border-amber-500/20 bg-amber-500/10 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-amber-700 dark:text-amber-500 pointer-events-none">
                  <Sparkles size={16} className="text-amber-500" /> Refine with AI
                </h3>
                <button
                  type="button"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onClick={() => setShowRefinePanel(false)}
                  className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Panel body (non-draggable) */}
              <div
                className="p-5 w-full overflow-y-auto custom-scrollbar flex-1 flex flex-col space-y-5 bg-amber-500/5 cursor-default"
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-amber-800/80 dark:text-amber-500/80 leading-relaxed">
                  Add personal context. The AI will weave this naturally into your generated letter.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-900 dark:text-amber-400 flex justify-between">
                      Why this company?
                      <span className="font-normal opacity-70 text-[10px]">{whyThisCompany.length}/300</span>
                    </label>
                    <textarea
                      placeholder="e.g. I've used your product since 2023..."
                      className="w-full min-h-[100px] bg-white dark:bg-black/40 text-sm resize-none border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      value={whyThisCompany}
                      onChange={(e) => setWhyThisCompany(e.target.value)}
                      maxLength={300}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-900 dark:text-amber-400 flex justify-between">
                      Key achievement
                      <span className="font-normal opacity-70 text-[10px]">{achievementToHighlight.length}/200</span>
                    </label>
                    <textarea
                      placeholder="e.g. Led a team of 4 to reduce API response time by 60%"
                      className="w-full min-h-[80px] bg-white dark:bg-black/40 text-sm resize-none border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      value={achievementToHighlight}
                      onChange={(e) => setAchievementToHighlight(e.target.value)}
                      maxLength={200}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleImprove}
                    disabled={(!whyThisCompany && !achievementToHighlight) || isGenerating || !activeLetter}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center gap-2 h-11 mt-2 font-medium text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isGenerating ? 'Applying Magic...' : 'Improve Cover Letter'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .ProseMirror p { margin-bottom: 1em; }
            .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
            .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
          `
        }} />
      </div>
      <ConfirmLeaveModal
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
        message="Are you sure you want to go back to the Home page?"
      />
    </>
  );
}
