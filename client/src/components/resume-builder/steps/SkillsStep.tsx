import { useState } from 'react';
import type { ResumeFormData, LanguageSkill } from '../../../types';

const MAX_CATEGORIES = 5;

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
  skillSuggestions?: string[];
  isGeneratingSkills?: boolean;
  onRegenerateSkills?: () => void;
}

// Inline SVG icons
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const GripVerticalIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function SkillsStep({
  data,
  onChange,
  skillSuggestions = [],
  isGeneratingSkills = false,
  onRegenerateSkills,
}: Props) {
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});
  const [langInput, setLangInput] = useState('');
  const [langProficiency, setLangProficiency] = useState<LanguageSkill['proficiency']>('fluent');

  const categories = data.skills.categories;

  const isSkillAdded = (skill: string) =>
    categories.some((cat) =>
      cat.items.some((item) => item.toLowerCase() === skill.toLowerCase())
    );

  const addSkillToCategory = (catIndex: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const cat = categories[catIndex];
    if (!cat) return;
    if (cat.items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, items: [...c.items, trimmed] } : c
    );
    onChange({ ...data, skills: { ...data.skills, categories: newCats } });
  };

  const removeSkillFromCategory = (catIndex: number, itemIndex: number) => {
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c
    );
    onChange({ ...data, skills: { ...data.skills, categories: newCats } });
  };

  const updateCategoryName = (catIndex: number, name: string) => {
    const newCats = categories.map((c, i) =>
      i === catIndex ? { ...c, category: name } : c
    );
    onChange({ ...data, skills: { ...data.skills, categories: newCats } });
  };

  const addCategory = () => {
    if (categories.length >= MAX_CATEGORIES) return;
    onChange({
      ...data,
      skills: { ...data.skills, categories: [...categories, { category: '', items: [] }] },
    });
  };

  const removeCategory = (catIndex: number) => {
    if (categories.length <= 1) return;
    onChange({
      ...data,
      skills: { ...data.skills, categories: categories.filter((_, i) => i !== catIndex) },
    });
  };

  const addLanguage = () => {
    const trimmed = langInput.trim();
    if (!trimmed) return;
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: [...data.skills.languages, { language: trimmed, proficiency: langProficiency }],
      },
    });
    setLangInput('');
  };

  const updateLanguageProficiency = (index: number, value: string) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: data.skills.languages.map((l, i) =>
          i === index ? { ...l, proficiency: value as LanguageSkill['proficiency'] } : l
        ),
      },
    });
  };

  const removeLanguage = (index: number) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: data.skills.languages.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* AI Suggestion Banner */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">AI Skill Suggestions</p>
            <p className="text-xs text-indigo-500">Role-specific suggestions for your resume</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegenerateSkills}
          disabled={isGeneratingSkills}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-md shadow-indigo-200 transition-colors ${
            isGeneratingSkills
              ? 'cursor-not-allowed bg-indigo-400 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isGeneratingSkills ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-white" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-3.5 w-3.5" />
              Suggest with AI
            </>
          )}
        </button>
      </div>

      {/* AI Suggestion Chips */}
      {skillSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {skillSuggestions.map((suggestion, index) => {
            const added = isSkillAdded(suggestion);
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!added && categories.length > 0) {
                    addSkillToCategory(0, suggestion);
                  }
                }}
                disabled={added}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  added
                    ? 'cursor-default border-green-300 bg-green-100 text-green-700'
                    : 'cursor-pointer border-indigo-200 bg-indigo-600/10 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100'
                }`}
              >
                {added ? '✓ ' : ''}
                {suggestion}
              </button>
            );
          })}
        </div>
      )}

      {/* Category Cards */}
      <div className="space-y-4">
        {categories.map((cat, catIndex) => (
          <div
            key={catIndex}
            className="group overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-3 py-2.5">
              <GripVerticalIcon className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground/50 hover:text-muted-foreground" />
              <input
                type="text"
                value={cat.category}
                onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                placeholder="Category name (e.g., Frontend, Patient Care, Analytics)"
                className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-2 text-base font-semibold text-foreground placeholder:text-muted-foreground transition-colors hover:bg-muted/50 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(catIndex)}
                  className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Remove category"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Card Body */}
            <div className="space-y-4 p-4">
              {/* Skills chips */}
              <div className="flex min-h-[40px] flex-wrap items-center gap-2">
                {cat.items.length === 0 ? (
                  <span className="px-1 text-sm italic text-muted-foreground">
                    No skills yet — add one below
                  </span>
                ) : (
                  cat.items.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm transition-all"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5 opacity-70" />
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSkillFromCategory(catIndex, itemIndex)}
                        className="ml-0.5 rounded-full p-0.5 text-indigo-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove skill"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add skill input */}
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={skillInputs[catIndex] || ''}
                  onChange={(e) => setSkillInputs({ ...skillInputs, [catIndex]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkillToCategory(catIndex, skillInputs[catIndex] || '');
                      setSkillInputs({ ...skillInputs, [catIndex]: '' });
                    }
                  }}
                  placeholder="Add a skill and press Enter..."
                  className="w-full bg-muted/50 rounded-xl py-2 pl-3 pr-20 border border-transparent text-sm text-foreground shadow-inner placeholder:text-muted-foreground transition-colors focus-visible:bg-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    addSkillToCategory(catIndex, skillInputs[catIndex] || '');
                    setSkillInputs({ ...skillInputs, [catIndex]: '' });
                  }}
                  className="absolute bottom-1 right-1 top-1 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Category button */}
        {categories.length < MAX_CATEGORIES && (
          <button
            type="button"
            onClick={addCategory}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
          >
            <PlusIcon className="h-5 w-5" />
            Add Category
          </button>
        )}
      </div>

      {/* Languages Section */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="mb-1 flex items-center gap-2">
          <GlobeIcon className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-foreground">Languages</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Add languages you speak and your proficiency level</p>

        <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-4">
          {/* Existing languages */}
          {data.skills.languages.length > 0 && (
            <div className="space-y-2">
              {data.skills.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                  <span className="bg-background border border-border rounded-lg px-3 py-1 text-sm font-semibold text-foreground">
                    {lang.language}
                  </span>
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguageProficiency(index, e.target.value)}
                    className="ml-auto w-36 h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none"
                  >
                    <option value="native">Native</option>
                    <option value="fluent">Fluent</option>
                    <option value="professional">Professional</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="basic">Basic</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Remove language"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add language controls */}
          <div className="flex flex-col gap-1">
          <div className="hidden sm:flex gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span className="flex-1">Language</span>
            <span className="w-40">Proficiency</span>
            <span className="w-[76px]" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage();
                }
              }}
              placeholder="e.g., English, Thai, Spanish"
              className="flex-1 bg-muted/50 rounded-xl px-3 py-2 border border-transparent text-sm text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:bg-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <select
              value={langProficiency}
              onChange={(e) => setLangProficiency(e.target.value as LanguageSkill['proficiency'])}
              className="w-40 bg-muted/50 rounded-xl px-2 py-2 border border-transparent text-sm text-foreground focus-visible:bg-background focus-visible:border-primary focus-visible:outline-none"
            >
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="professional">Professional</option>
              <option value="intermediate">Intermediate</option>
              <option value="basic">Basic</option>
            </select>
            <button
              type="button"
              onClick={addLanguage}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
