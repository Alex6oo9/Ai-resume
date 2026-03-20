import { useState } from 'react';
import { Template } from '../../types/template.types';
import { useTemplates } from '../../hooks/useTemplates';
import { useTemplateSwitch } from '../../hooks/useTemplateSwitch';
import TemplateCard from './TemplateCard';
import UpgradePrompt from './UpgradePrompt';

interface Props {
  resumeId?: string; // Optional — if absent, selection only updates local state
  currentTemplateName?: string;
  onTemplateChanged: (template: Template) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'modern', label: 'Modern' },
  { value: 'ats', label: 'ATS' },
] as const;

export default function TemplateSwitcher({
  resumeId,
  currentTemplateName,
  onTemplateChanged,
  onClose,
}: Props) {
  const { templates, userTier, loading, error } = useTemplates();
  const { doSwitch, switching } = useTemplateSwitch(resumeId ?? '', (t) => {
    onTemplateChanged(t);
    onClose();
  });
  const [category, setCategory] = useState<string>('all');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const filtered = templates.filter(
    (t) => category === 'all' || t.category === category
  );

  const handleSelect = async (template: Template) => {
    if (template.isLocked) {
      setShowUpgrade(true);
      return;
    }
    if (resumeId) {
      // Persist to DB when resume is saved
      await doSwitch(template.id);
    } else {
      // No saved resume yet — just update local preview
      onTemplateChanged(template);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-destructive">
        <p className="font-medium">Failed to load templates</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Choose a Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {resumeId
              ? 'Switch templates anytime — your content is always preserved'
              : 'Preview templates — save a draft to persist your selection'}
          </p>
          {userTier !== 'free' && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded-full capitalize">
              ✨ {userTier} plan
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-2xl flex-shrink-0"
        >
          &times;
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                category === cat.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSelected={t.name === currentTemplateName}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No templates in this category</p>
        </div>
      )}

      {/* Switching overlay */}
      {switching && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="font-medium text-foreground">Switching template...</p>
          </div>
        </div>
      )}

      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
