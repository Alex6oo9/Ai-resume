import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, BarChart2 } from 'lucide-react';
import { getResume } from '../utils/api';

export default function UploadedResumeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getResume(id)
      .then((data) => {
        setTitle(data.resume?.target_role ?? null);
      })
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Always route through server proxy — sets Content-Disposition: inline so browser renders PDF
  const displayUrl = `/api/resume/${id}/file`;
  const displayTitle = title || 'Uploaded Resume';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background flex-shrink-0 h-14">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex-shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>

            {loading ? (
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            ) : (
              <span className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-sm">
                {displayTitle}
              </span>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0">
              PDF Upload
            </span>
          </div>
        </div>

        {/* Right: analysis + download */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/resume/${id}`)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analysis</span>
          </button>

          <a
            href={displayUrl}
            download="resume.pdf"
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">Download</span>
          </a>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <iframe
          src={displayUrl}
          className="w-full h-full border-0"
          title={`${displayTitle} PDF`}
        />
      </div>
    </div>
  );
}
