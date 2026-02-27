import { Template } from '../../types/template.types';

interface Props {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template) => void;
}

export default function TemplateCard({ template, isSelected, onSelect }: Props) {
  const handleClick = () => {
    if (!template.isLocked) {
      onSelect(template);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-xl border-2 transition-all
        ${isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}
        ${template.isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Thumbnail area */}
      <div className="aspect-[8.5/11] bg-gray-50 rounded-t-xl flex items-center justify-center overflow-hidden">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              e.currentTarget.nextElementSibling?.removeAttribute('style');
            }}
          />
        ) : null}
        <div style={template.thumbnailUrl ? { display: 'none' } : undefined} className="w-full h-full">
          <TemplatePlaceholder name={template.name} />
        </div>
      </div>

      {/* Lock badge */}
      {template.isLocked && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
          <span>🔒</span>
          <span className="capitalize">{template.requiredTier}</span>
        </div>
      )}

      {/* Active badge */}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          ✓ Active
        </div>
      )}

      {/* ATS badge */}
      {template.isAtsFriendly && (
        <div className="absolute bottom-14 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
          ATS
        </div>
      )}

      {/* Info */}
      <div className="p-3 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {template.displayName}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {template.description}
        </p>
        {template.requiredTier !== 'free' && (
          <span className="mt-1.5 inline-block text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full capitalize">
            {template.requiredTier} plan
          </span>
        )}
      </div>
    </div>
  );
}

/** Simple visual placeholder when no thumbnail is available */
function TemplatePlaceholder({ name }: { name: string }) {
  const colors: Record<string, { bg: string; accent: string }> = {
    modern_minimal: { bg: 'bg-white', accent: 'bg-blue-500' },
    ats_friendly: { bg: 'bg-white', accent: 'bg-gray-800' },
    creative_bold: { bg: 'bg-violet-50', accent: 'bg-violet-600' },
    professional_classic: { bg: 'bg-slate-50', accent: 'bg-slate-700' },
    tech_focused: { bg: 'bg-slate-900', accent: 'bg-sky-400' },
  };
  const c = colors[name] || { bg: 'bg-white', accent: 'bg-blue-500' };

  return (
    <div className={`w-full h-full ${c.bg} p-4 flex flex-col gap-2`}>
      <div className={`h-2 w-16 rounded ${c.accent} opacity-90`} />
      <div className="h-px bg-gray-200 my-1" />
      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-gray-200 rounded" />
        <div className="h-1.5 w-5/6 bg-gray-200 rounded" />
        <div className="h-1.5 w-4/6 bg-gray-200 rounded" />
      </div>
      <div className={`h-1.5 w-10 rounded ${c.accent} opacity-70 mt-2`} />
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-gray-100 rounded" />
        <div className="h-1.5 w-full bg-gray-100 rounded" />
        <div className="h-1.5 w-3/4 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
