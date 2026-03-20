import { useRef } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  id?: string;
  'aria-label'?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '100px',
  id,
  'aria-label': ariaLabel,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (prefix: string, suffix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.setSelectionRange(start + prefix.length, end + prefix.length);
      el.focus();
    });
  };

  const insertLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    // Get selected text or current line
    const selectedText = value.slice(start, end);
    if (selectedText.includes('\n')) {
      // Multi-line: prefix each line
      const lines = selectedText.split('\n');
      const prefixed = lines.map((l) => (l.trim() ? prefix + l.replace(/^[•\d]+[.)]\s*/, '') : l)).join('\n');
      const newValue = value.slice(0, start) + prefixed + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.setSelectionRange(start, start + prefixed.length);
        el.focus();
      });
    } else {
      // Single line or cursor: insert bullet at line start
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start);
      const lineText = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      const stripped = lineText.replace(/^[•\d]+[.)]\s*/, '');
      const newLine = prefix + stripped;
      const after = lineEnd === -1 ? '' : value.slice(lineEnd);
      const newValue = value.slice(0, lineStart) + newLine + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        const newCursor = lineStart + newLine.length - stripped.length + (start - lineStart - (lineText.length - stripped.length));
        el.setSelectionRange(newCursor, newCursor);
        el.focus();
      });
    }
  };

  const insertBulletList = () => insertLinePrefix('• ');

  const insertNumberedList = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.slice(start, end);
    if (selectedText.includes('\n')) {
      const lines = selectedText.split('\n');
      const prefixed = lines.map((l, i) => (l.trim() ? `${i + 1}. ${l.replace(/^[•\d]+[.)]\s*/, '')}` : l)).join('\n');
      const newValue = value.slice(0, start) + prefixed + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.setSelectionRange(start, start + prefixed.length);
        el.focus();
      });
    } else {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start);
      const lineText = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      const stripped = lineText.replace(/^[•\d]+[.)]\s*/, '');
      const newLine = `1. ${stripped}`;
      const after = lineEnd === -1 ? '' : value.slice(lineEnd);
      const newValue = value.slice(0, lineStart) + newLine + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
        el.focus();
      });
    }
  };

  return (
    <div className="rounded-lg border border-input overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-input bg-muted/30 dark:bg-muted/10 px-2 py-1.5">
        {/* Formatting */}
        <button
          type="button"
          aria-label="Bold"
          title="Bold (**text**)"
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            wrapSelection('**', '**');
          }}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          title="Italic (*text*)"
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            wrapSelection('*', '*');
          }}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          aria-label="Bullet list"
          title="Bullet list"
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            insertBulletList();
          }}
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          title="Numbered list"
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            insertNumberedList();
          }}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <span className="ml-auto text-[10px] text-muted-foreground/50 pr-1 hidden sm:block">
          Markdown supported
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight }}
        className="w-full bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-y leading-relaxed"
      />
    </div>
  );
}
