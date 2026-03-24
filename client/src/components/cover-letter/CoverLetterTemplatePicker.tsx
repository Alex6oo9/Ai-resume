import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { COVER_LETTER_TEMPLATES, type CoverLetterTemplateId } from './coverLetterTemplates';

interface CoverLetterTemplatePickerProps {
  selected: CoverLetterTemplateId;
  onSelect: (id: CoverLetterTemplateId) => void;
  onClose: () => void;
}

function ClassicThumbnail() {
  return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="160" height="200" fill="white"/>
      {/* Name */}
      <rect x="12" y="18" width="80" height="8" rx="2" fill="#111827"/>
      {/* Job title */}
      <rect x="12" y="30" width="55" height="5" rx="1.5" fill="#9ca3af"/>
      {/* Contact info */}
      <rect x="12" y="40" width="30" height="3" rx="1" fill="#d1d5db"/>
      <rect x="48" y="40" width="25" height="3" rx="1" fill="#d1d5db"/>
      <rect x="79" y="40" width="35" height="3" rx="1" fill="#d1d5db"/>
      {/* Divider */}
      <line x1="12" y1="50" x2="148" y2="50" stroke="#d1d5db" strokeWidth="1"/>
      {/* Date */}
      <rect x="12" y="58" width="45" height="3" rx="1" fill="#d1d5db"/>
      {/* Recipient */}
      <rect x="12" y="68" width="60" height="3" rx="1" fill="#9ca3af"/>
      <rect x="12" y="74" width="40" height="3" rx="1" fill="#d1d5db"/>
      {/* Body lines */}
      <rect x="12" y="88" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="95" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="102" width="120" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="112" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="119" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="126" width="100" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="136" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="143" width="90" height="3" rx="1" fill="#e5e7eb"/>
      {/* Signature */}
      <rect x="12" y="158" width="50" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="165" width="65" height="3" rx="1" fill="#9ca3af"/>
    </svg>
  );
}

function BoldArchitectThumbnail() {
  return (
    <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="160" height="200" fill="white"/>
      {/* Centered big job title */}
      <rect x="30" y="18" width="100" height="10" rx="2" fill="#111827"/>
      {/* Contact icon row — centered */}
      <rect x="15" y="35" width="38" height="3" rx="1" fill="#d1d5db"/>
      <rect x="61" y="35" width="38" height="3" rx="1" fill="#d1d5db"/>
      <rect x="107" y="35" width="38" height="3" rx="1" fill="#d1d5db"/>
      {/* Thick black divider */}
      <rect x="12" y="45" width="136" height="2" fill="#111827"/>
      {/* Date */}
      <rect x="12" y="54" width="45" height="3" rx="1" fill="#d1d5db"/>
      {/* Recipient */}
      <rect x="12" y="63" width="60" height="3" rx="1" fill="#9ca3af"/>
      <rect x="12" y="70" width="40" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="77" width="50" height="3" rx="1" fill="#d1d5db"/>
      {/* Body lines */}
      <rect x="12" y="90" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="97" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="104" width="120" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="114" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="121" width="100" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="131" width="136" height="3" rx="1" fill="#e5e7eb"/>
      <rect x="12" y="138" width="90" height="3" rx="1" fill="#e5e7eb"/>
      {/* Signature */}
      <rect x="12" y="155" width="50" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="162" width="65" height="3" rx="1" fill="#9ca3af"/>
    </svg>
  );
}

const THUMBNAILS: Record<string, () => JSX.Element> = {
  classic: ClassicThumbnail,
  bold_architect: BoldArchitectThumbnail,
};

export default function CoverLetterTemplatePicker({ selected, onSelect, onClose }: CoverLetterTemplatePickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div
        ref={ref}
        className="bg-card border border-border shadow-2xl rounded-2xl p-5 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Letter Templates</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Template cards — horizontal row */}
        <div className="flex flex-wrap gap-4">
          {COVER_LETTER_TEMPLATES.map((tpl) => {
            const Thumbnail = THUMBNAILS[tpl.id];
            const isSelected = selected === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => { onSelect(tpl.id); onClose(); }}
                className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left w-[120px] ${
                  isSelected
                    ? 'border-teal-500 shadow-md shadow-teal-500/20'
                    : 'border-border hover:border-teal-300 hover:shadow-sm'
                }`}
              >
                {/* Document thumbnail */}
                <div className="w-full aspect-[4/5] bg-white border-b border-gray-100 overflow-hidden">
                  {Thumbnail ? <Thumbnail /> : null}
                </div>

                {/* Label */}
                <div className="px-2.5 py-2 bg-card">
                  <p className="text-[12px] font-semibold text-foreground">{tpl.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{tpl.description}</p>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-teal-500 flex items-center justify-center shadow">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
