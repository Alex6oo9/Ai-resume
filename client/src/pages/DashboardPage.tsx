import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, LayoutTemplate, Sparkles, PenLine, MoreHorizontal, FileText, Mail, Eye, Download } from 'lucide-react';
import { ResumeSummary, CoverLetter } from '../types';
import { listResumes, deleteResume, listCoverLetters, deleteCoverLetter, getResume } from '../utils/api';
import { useToastContext } from '../contexts/ToastContext';
import { useAuthContext } from '../contexts/AuthContext';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { ResumeFormData } from '../types';
import type { TemplateId } from '../components/templates/types';

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

// ── PDF Canvas Thumbnail ───────────────────────────────────────────────────────

function PdfThumbnailCanvas({ resumeId }: { resumeId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument(`/api/resume/${resumeId}/file`).promise;
        const page = await pdf.getPage(1);
        if (cancelled || !canvasRef.current) return;

        const nativeViewport = page.getViewport({ scale: 1 });
        const scale = 400 / nativeViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
        if (!cancelled) setState('done');
      } catch {
        if (!cancelled) setState('error');
      }
    }

    render();
    return () => { cancelled = true; };
  }, [resumeId]);

  return (
    <>
      {state === 'loading' && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      )}
      {state === 'error' && <ResumeWireframe />}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          opacity: state === 'done' ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </>
  );
}

function ModernIdentity() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-3 gap-2 overflow-hidden">
      <div className="flex flex-col items-center gap-1 pb-2 border-b border-neutral-200">
        <div className="h-3 w-1/2 rounded bg-neutral-800" />
        <div className="h-1.5 w-1/3 rounded bg-neutral-400" />
        <div className="h-1.5 w-2/5 rounded bg-neutral-300 mt-0.5" />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-1.5 w-1/4 rounded bg-neutral-700" />
        <div className="h-px w-full bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="mt-1 h-1.5 w-1/4 rounded bg-neutral-700" />
        <div className="h-px w-full bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function YellowSplitIdentity() {
  return (
    <div className="w-full h-full bg-white flex flex-row overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden" style={{ width: '38%', backgroundColor: '#2c2c2c' }}>
        <div style={{ height: '6px', backgroundColor: '#fdb913', flexShrink: 0 }} />
        <div className="mx-auto mt-2 rounded-full" style={{ width: 22, height: 22, backgroundColor: '#fdb913', opacity: 0.7, flexShrink: 0 }} />
        <div className="flex flex-col gap-1 p-2 mt-1">
          <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: '#fdb913', opacity: 0.8 }} />
          <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#555' }} />
          <div className="h-1.5 w-4/5 rounded" style={{ backgroundColor: '#555' }} />
          <div className="mt-1 h-1.5 w-3/4 rounded" style={{ backgroundColor: '#fdb913', opacity: 0.6 }} />
          <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#555' }} />
          <div className="h-1.5 w-3/5 rounded" style={{ backgroundColor: '#555' }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-2 flex-1">
        <div className="h-2.5 w-3/4 rounded bg-neutral-800" />
        <div className="h-1.5 w-1/2 rounded bg-neutral-400" />
        <div className="mt-1 h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="mt-1 h-1.5 w-3/4 rounded bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function DarkRibbonIdentity() {
  return (
    <div className="w-full h-full flex flex-row overflow-hidden">
      <div className="flex flex-col h-full p-2 gap-1.5" style={{ width: '35%', backgroundColor: '#2b2b2b' }}>
        <div className="rounded-full mx-auto" style={{ width: 22, height: 22, backgroundColor: '#444', flexShrink: 0 }} />
        <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#555' }} />
        <div className="h-1.5 w-4/5 rounded" style={{ backgroundColor: '#555' }} />
        <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#444' }} />
        <div className="h-1.5 w-3/5 rounded" style={{ backgroundColor: '#555' }} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="p-2 pb-1">
          <div className="h-2.5 w-2/3 rounded bg-neutral-800" />
          <div className="h-1.5 w-1/2 rounded bg-neutral-400 mt-1" />
        </div>
        <div className="h-4 w-full px-2 flex items-center" style={{ backgroundColor: '#2b2b2b' }}>
          <div className="h-1.5 w-1/3 rounded" style={{ backgroundColor: '#888' }} />
        </div>
        <div className="p-2 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-neutral-200" />
          <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
        </div>
        <div className="h-4 w-full px-2 flex items-center" style={{ backgroundColor: '#2b2b2b' }}>
          <div className="h-1.5 w-1/4 rounded" style={{ backgroundColor: '#888' }} />
        </div>
        <div className="p-2 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-neutral-200" />
          <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

function MinimalistBlockIdentity() {
  return (
    <div className="w-full h-full flex flex-row overflow-hidden">
      <div className="flex flex-col h-full p-2 gap-1.5" style={{ width: '33%', backgroundColor: '#454545' }}>
        <div className="rounded-full mx-auto" style={{ width: 20, height: 20, backgroundColor: '#666', flexShrink: 0 }} />
        <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#666' }} />
        <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: '#666' }} />
        <div className="mt-1 h-px w-full" style={{ backgroundColor: '#555' }} />
        <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#555' }} />
        <div className="h-1.5 w-4/5 rounded" style={{ backgroundColor: '#555' }} />
      </div>
      <div className="flex flex-col flex-1 bg-white overflow-hidden">
        <div className="p-2">
          <div className="h-2.5 w-2/3 rounded bg-neutral-800" />
          <div className="h-1.5 w-1/2 rounded bg-neutral-400 mt-1" />
        </div>
        <div className="h-5 px-2 flex items-center" style={{ backgroundColor: '#3b3434' }}>
          <div className="h-1.5 w-1/3 rounded" style={{ backgroundColor: '#aaa' }} />
        </div>
        <div className="p-2 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-neutral-200" />
          <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
        </div>
        <div className="h-5 px-2 flex items-center" style={{ backgroundColor: '#3b3434' }}>
          <div className="h-1.5 w-1/4 rounded" style={{ backgroundColor: '#aaa' }} />
        </div>
        <div className="p-2 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

function EarthToneIdentity() {
  return (
    <div className="w-full h-full flex flex-row overflow-hidden" style={{ backgroundColor: '#EFEBE3' }}>
      <div style={{ width: '6px', backgroundColor: '#483930', flexShrink: 0, margin: '12px 0 12px 8px', borderRadius: '3px' }} />
      <div className="flex flex-col flex-1 p-3 gap-2 overflow-hidden">
        <div className="flex flex-col gap-1 pb-2" style={{ borderBottom: '1px solid #c9b9a8' }}>
          <div className="h-3 w-1/2 rounded" style={{ backgroundColor: '#483930' }} />
          <div className="h-1.5 w-1/3 rounded" style={{ backgroundColor: '#8b7b6b' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-1/4 rounded" style={{ backgroundColor: '#483930', opacity: 0.7 }} />
          <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#c9b9a8' }} />
          <div className="h-1.5 w-4/5 rounded" style={{ backgroundColor: '#c9b9a8' }} />
          <div className="h-1.5 w-full rounded" style={{ backgroundColor: '#c9b9a8' }} />
          <div className="mt-1 h-1.5 w-1/3 rounded" style={{ backgroundColor: '#483930', opacity: 0.7 }} />
          <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: '#c9b9a8' }} />
        </div>
      </div>
    </div>
  );
}

function AtsCleanIdentity() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-3 gap-2 overflow-hidden">
      <div className="flex flex-col items-center gap-1 pb-1">
        <div className="h-3 w-1/2 rounded bg-black" />
        <div className="h-1.5 w-2/5 rounded bg-neutral-400" />
      </div>
      <div className="h-2 w-full border-b-2 border-black flex items-center">
        <div className="h-1.5 w-1/4 rounded bg-black" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
      </div>
      <div className="h-2 w-full border-b-2 border-black flex items-center">
        <div className="h-1.5 w-1/5 rounded bg-black" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function AtsLinedIdentity() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-3 gap-2 overflow-hidden">
      <div className="flex flex-col gap-1 pb-1">
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: '#1a3557' }} />
        <div className="h-1.5 w-1/3 rounded bg-neutral-400" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="h-1.5 w-1/4 rounded" style={{ backgroundColor: '#1a3557' }} />
        <div className="h-px w-full" style={{ backgroundColor: '#1a3557' }} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
        <div className="h-1.5 w-full rounded bg-neutral-200" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="h-1.5 w-1/5 rounded" style={{ backgroundColor: '#1a3557' }} />
        <div className="h-px w-full" style={{ backgroundColor: '#1a3557' }} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded bg-neutral-200" />
        <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function TemplateIdentityPreview({ templateId }: { templateId: string }) {
  switch (templateId) {
    case 'modern': return <ModernIdentity />;
    case 'modern_yellow_split': return <YellowSplitIdentity />;
    case 'dark_ribbon_modern': return <DarkRibbonIdentity />;
    case 'modern_minimalist_block': return <MinimalistBlockIdentity />;
    case 'editorial_earth_tone': return <EarthToneIdentity />;
    case 'ats_clean': return <AtsCleanIdentity />;
    case 'ats_lined': return <AtsLinedIdentity />;
    default: return <ResumeWireframe />;
  }
}

function BuiltResumeThumbnail({ resumeId, templateId }: { resumeId: string; templateId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ResumeFormData | null>(null);
  const [scale, setScale] = useState(0);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useLayoutEffect(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / 816);
    }
  }, []);

  useEffect(() => {
    getResume(resumeId)
      .then((data) => {
        if (data.resume?.form_data) {
          setFormData(data.resume.form_data as ResumeFormData);
          setState('done');
        } else {
          setState('error');
        }
      })
      .catch(() => setState('error'));
  }, [resumeId]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {state === 'loading' && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      )}
      {state === 'error' && <TemplateIdentityPreview templateId={templateId} />}
      {state === 'done' && formData && scale > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '816px',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}>
          <ResumeTemplateSwitcher
            templateId={templateId as TemplateId}
            data={formData}
            isPreview={true}
          />
        </div>
      )}
    </div>
  );
}

function CoverLetterThumbnail({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / 580);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'white' }}>
      {scale > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '580px',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            padding: '36px 40px',
            background: 'white',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '10px',
            lineHeight: '1.7',
            color: '#1a1a1a',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}

function ThumbnailArea({ doc }: { doc: UnifiedDoc }) {
  if (doc.source === 'cover_letter') {
    return doc.content
      ? <CoverLetterThumbnail content={doc.content} />
      : <CoverLetterWireframe />;
  }
  if (doc.source === 'built') {
    return <BuiltResumeThumbnail resumeId={doc.id} templateId={doc.template_id ?? 'modern'} />;
  }
  return <PdfThumbnailCanvas resumeId={doc.id} />;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DocTab = 'all' | 'built' | 'uploaded' | 'cover_letters';

interface UnifiedDoc {
  id: string;
  source: 'built' | 'uploaded' | 'cover_letter';
  title: string;
  subtitle: string;
  score: number | null;
  created_at: string;
  file_path?: string | null;
  template_id?: string | null;
  content?: string | null;
}

// ── Document Card ─────────────────────────────────────────────────────────────

interface DocCardProps {
  doc: UnifiedDoc;
  onDelete: (id: string, source: UnifiedDoc['source']) => void;
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

  const editHref = doc.source === 'cover_letter'
    ? `/cover-letter/new?id=${doc.id}`
    : `/build/${doc.id}`;

  const scoreColor = doc.score !== null
    ? (doc.score >= 80 ? 'text-emerald-600' : 'text-amber-500')
    : null;

  // Badge config per source
  const badge = doc.source === 'built'
    ? { label: 'Built with AI', className: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400', icon: <Sparkles className="w-3 h-3" /> }
    : doc.source === 'uploaded'
    ? { label: 'PDF Upload', className: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800 dark:text-amber-400', icon: <Upload className="w-3 h-3" /> }
    : { label: 'Letter', className: 'bg-teal-500/10 text-teal-700 border-teal-200 dark:text-teal-400', icon: null };

  function handlePrimaryAction() {
    if (doc.source === 'uploaded') {
      navigate(`/resume/${doc.id}/view`);
    } else {
      navigate(editHref);
    }
  }

  return (
    <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 flex flex-col gap-3">
      {/* Preview card */}
      <div
        className="relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden group aspect-[8.5/11] cursor-pointer"
        onClick={handlePrimaryAction}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePrimaryAction(); }}
        aria-label={`${doc.source === 'uploaded' ? 'View PDF' : 'Edit'}: ${doc.title}`}
      >
        {/* Thumbnail */}
        <div className="absolute inset-0">
          <ThumbnailArea doc={doc} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white text-neutral-900 rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:bg-neutral-100">
            {doc.source === 'uploaded'
              ? <><Eye className="w-4 h-4" /> View PDF</>
              : <><PenLine className="w-4 h-4" /> Edit</>
            }
          </div>
        </div>

        {/* Score badge — top left */}
        {doc.score !== null && (
          <div className="absolute top-2 left-2 bg-background/95 border border-border rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
            <span className={scoreColor ?? ''}>{doc.score}%</span>
          </div>
        )}

        {/* Source badge — top right */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.icon}
          {badge.label}
        </div>
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
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label={`Menu for ${doc.title}`}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-border bg-card shadow-lg py-1">
              {doc.source === 'uploaded' ? (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/resume/${doc.id}/view`); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground"
                  >
                    <Eye className="w-3.5 h-3.5" /> View PDF
                  </button>
                  <a
                    href={`/api/resume/${doc.id}/file`}
                    download
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); navigate(editHref); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground"
                >
                  <PenLine className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              <button
                onClick={() => { setMenuOpen(false); onDelete(doc.id, doc.source); }}
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

  const handleDelete = async (id: string, source: UnifiedDoc['source']) => {
    const label = source === 'cover_letter' ? 'cover letter' : 'resume';
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;
    try {
      if (source !== 'cover_letter') {
        await deleteResume(id);
        setResumes((prev) => prev.filter((r) => r.id !== id));
        showToast('Resume deleted');
      } else {
        await deleteCoverLetter(id);
        setCoverLetters((prev) => prev.filter((c) => c.id !== id));
        showToast('Cover letter deleted');
      }
    } catch {
      showToast(`Failed to delete ${label}`, 'error');
    }
  };

  // Build unified doc list
  const allDocs: UnifiedDoc[] = [
    ...resumes.map((r): UnifiedDoc => ({
      id: r.id,
      source: r.file_path !== null ? 'uploaded' : 'built',
      title: r.title || r.target_role || 'Untitled Resume',
      subtitle: new Date(r.created_at).toLocaleDateString(),
      score: r.match_percentage ?? null,
      created_at: r.created_at,
      file_path: r.file_path,
      template_id: r.template_id,
    })),
    ...coverLetters.map((c): UnifiedDoc => ({
      id: c.id,
      source: 'cover_letter',
      title: c.job_title
        ? `${c.job_title}${c.company_name ? ` at ${c.company_name}` : ''}`
        : c.company_name || 'Cover Letter',
      subtitle: `${new Date(c.created_at).toLocaleDateString()}${c.company_name ? ` • ${c.company_name}` : ''}`,
      score: null,
      created_at: c.created_at,
      content: c.content,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredDocs = activeTab === 'all'
    ? allDocs
    : activeTab === 'built'
      ? allDocs.filter((d) => d.source === 'built')
      : activeTab === 'uploaded'
        ? allDocs.filter((d) => d.source === 'uploaded')
        : allDocs.filter((d) => d.source === 'cover_letter');

  const tabs: { key: DocTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'built', label: 'Built' },
    { key: 'uploaded', label: 'Uploaded' },
    { key: 'cover_letters', label: 'Cover Letters' },
  ];

  const emptyMessage = {
    all: { title: 'No documents yet', hint: <>Upload one or build from scratch to get started.</> },
    built: { title: 'No built resumes yet', hint: <><Link to="/build" className="text-primary hover:underline">Build a resume</Link> using our AI-powered form.</> },
    uploaded: { title: 'No uploaded resumes yet', hint: <><Link to="/upload" className="text-primary hover:underline">Analyze a PDF</Link> to get an AI score on your existing resume.</> },
    cover_letters: { title: 'No cover letters yet', hint: <>Create one from the <Link to="/cover-letter/new" className="text-primary hover:underline">Cover Letters</Link> tool above.</> },
  };

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

          {/* Box 2: Cover Letters */}
          <Link
            to="/cover-letter/new"
            className="col-span-12 sm:col-span-6 lg:col-span-4 lg:row-span-2 rounded-3xl border border-border bg-card p-7 shadow-sm hover:shadow-xl hover:border-teal-400/40 flex flex-col justify-between group transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <span className="bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs px-2.5 py-1 rounded-full font-medium border border-teal-200/50 dark:border-teal-800/50">Beta</span>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Cover Letters</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Generate tailored, ATS-friendly cover letters in seconds using your resume and the job description.
              </p>

              <ul className="space-y-4">
                {([
                  [Sparkles, 'AI-powered personalization'],
                  [FileText, 'Multiple tones & lengths'],
                  [Mail, 'Keyword-optimized content'],
                ] as [typeof Sparkles, string][]).map(([Icon, text], i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              <Mail className="w-4 h-4" />
              <span>Create Cover Letter</span>
              <span className="ml-auto text-lg leading-none">→</span>
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
                {emptyMessage[activeTab].title}
              </p>
              <p className="text-xs text-muted-foreground">
                {emptyMessage[activeTab].hint}
              </p>
            </div>
          )}

          {/* Document grid */}
          {!loading && !error && filteredDocs.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {filteredDocs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
