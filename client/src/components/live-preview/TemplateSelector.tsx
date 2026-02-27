import { useState } from 'react';
import { getAllTemplates } from './templateTypes';
import TemplatePreviewModal from './TemplatePreviewModal';

interface Props {
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
}

/**
 * TemplateSelector Component
 *
 * Displays template options and allows users to switch between them.
 * Shows template cards with name, description, and preview option.
 */
export default function TemplateSelector({ selectedTemplate, onTemplateChange }: Props) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const templates = getAllTemplates();

  return (
    <>
      <div className="template-selector">
        <h3 className="mb-4 text-sm font-medium text-gray-700">Choose a Template</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplate;

            return (
              <div
                key={template.id}
                className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => onTemplateChange(template.id)}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute right-2 top-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Template Thumbnail */}
                <div className={`mb-3 flex h-32 items-center justify-center rounded border ${isSelected ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                  <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Template Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {template.name}
                    </h4>
                    {template.isPremium && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {template.description}
                  </p>
                </div>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template.id);
                  }}
                  className={`mt-3 w-full rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Preview Template
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          templateId={previewTemplate}
        />
      )}
    </>
  );
}
