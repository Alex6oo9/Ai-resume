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
      className={`relative rounded-xl border-2 bg-card transition-all
        ${isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/30'
          : 'border-border hover:border-blue-400 hover:shadow-md'}
        ${template.isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer group'}`}
    >
      {/* Thumbnail area */}
      <div className="aspect-[8.5/11] bg-muted rounded-t-xl flex items-center justify-center overflow-hidden relative">
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
        {!template.isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl">
            <span className="text-white text-xs font-semibold bg-blue-500 px-3 py-1.5 rounded-full">
              Use Template
            </span>
          </div>
        )}
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
      <div className="p-3 border-t border-border">
        <h3 className="font-semibold text-foreground text-sm truncate">
          {template.displayName}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {template.description}
        </p>
        {template.requiredTier !== 'free' && (
          <span className="mt-1.5 inline-block text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded-full capitalize">
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
    modern:                  { bg: 'bg-white', accent: 'bg-blue-500' },
    modern_yellow_split:     { bg: 'bg-gray-900', accent: 'bg-yellow-400' },
    dark_ribbon_modern:      { bg: 'bg-gray-900', accent: 'bg-white' },
    modern_minimalist_block: { bg: 'bg-gray-800', accent: 'bg-gray-300' },
    editorial_earth_tone:    { bg: 'bg-amber-50', accent: 'bg-amber-800' },
    ats_clean:               { bg: 'bg-white', accent: 'bg-gray-800' },
    ats_lined:               { bg: 'bg-white', accent: 'bg-blue-800' },
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
