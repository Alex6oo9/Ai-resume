import { useState } from 'react';
import type { ResumeFormData } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
  isGenerating?: boolean;
  generationError?: string | null;
  targetRole?: string;
  targetIndustry?: string;
  onRegenerate?: () => void;
  suggestions?: string[];
}

const SOFT_SKILL_OPTIONS = [
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Leadership',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
  'Creativity',
  'Analytical Thinking',
  'Attention to Detail',
];

type SkillTag = {
  label: string;
  type: 'technical' | 'soft' | 'language';
  categoryIndex?: number;
  itemIndex?: number;
  languageIndex?: number;
};

export default function SkillsStep({
  data,
  onChange,
  isGenerating = false,
  generationError = null,
  targetRole = '',
  onRegenerate,
  suggestions = [],
}: Props) {
  const [newSkill, setNewSkill] = useState('');

  // Get technical skills only (not soft skills or languages)
  const getTechnicalSkills = (): SkillTag[] => {
    const skills: SkillTag[] = [];
    data.skills.technical.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        skills.push({
          label: item,
          type: 'technical',
          categoryIndex: catIndex,
          itemIndex,
        });
      });
    });
    return skills;
  };

  const removeTechnicalSkill = (skill: SkillTag) => {
    if (skill.categoryIndex !== undefined && skill.itemIndex !== undefined) {
      const newTechnical = data.skills.technical
        .map((cat, catIdx) => {
          if (catIdx === skill.categoryIndex) {
            return {
              ...cat,
              items: cat.items.filter((_, itemIdx) => itemIdx !== skill.itemIndex),
            };
          }
          return cat;
        })
        .filter((cat) => cat.items.length > 0);

      onChange({
        ...data,
        skills: { ...data.skills, technical: newTechnical },
      });
    }
  };

  const addTechnicalSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Check if already exists
    const existing = getTechnicalSkills().find(
      (s) => s.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return;

    // Add to "General" category by default
    const generalCategory = data.skills.technical.find((cat) => cat.category === 'General');

    if (generalCategory) {
      onChange({
        ...data,
        skills: {
          ...data.skills,
          technical: data.skills.technical.map((cat) =>
            cat.category === 'General' ? { ...cat, items: [...cat.items, trimmed] } : cat
          ),
        },
      });
    } else {
      onChange({
        ...data,
        skills: {
          ...data.skills,
          technical: [...data.skills.technical, { category: 'General', items: [trimmed] }],
        },
      });
    }
  };

  const handleAddSkill = () => {
    addTechnicalSkill(newSkill);
    setNewSkill('');
  };

  const handleAddSuggestion = (suggestion: string) => {
    addTechnicalSkill(suggestion);
  };

  const toggleSoftSkill = (skill: string) => {
    const current = data.skills.soft;
    const updated = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];

    onChange({
      ...data,
      skills: { ...data.skills, soft: updated },
    });
  };

  const addLanguage = () => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: [...data.skills.languages, { language: '', proficiency: 'basic' }],
      },
    });
  };

  const updateLanguage = (
    index: number,
    field: 'language' | 'proficiency',
    value: string
  ) => {
    onChange({
      ...data,
      skills: {
        ...data.skills,
        languages: data.skills.languages.map((lang, i) =>
          i === index ? { ...lang, [field]: value } : lang
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

  const technicalSkills = getTechnicalSkills();

  return (
    <div className="max-w-3xl space-y-5">
      {/* Loading State */}
      {isGenerating && (
        <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 text-center shadow-[0_4px_20px_rgba(139,92,246,0.1)]">
          <div className="mx-auto mb-3 h-10 w-10">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 animate-ping rounded-full bg-violet-300 opacity-20"></div>
              <div className="absolute inset-1 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500"></div>
            </div>
          </div>
          <p className="text-sm font-medium text-violet-700">
            Generating skills for {targetRole}...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isGenerating && generationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <svg
              className="mt-0.5 h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Generation failed</p>
              <p className="mt-1 text-sm text-red-600">{generationError}</p>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills Display */}
      {!isGenerating && !generationError && (
        <div className="space-y-5">
          {/* AI Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4 shadow-[0_4px_20px_rgba(139,92,246,0.12)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  {/* AI badge */}
                  <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    AI Generated
                  </span>
                  <h2 className="text-base font-semibold text-violet-900">
                    Suggested skills for {targetRole}
                  </h2>
                  <p className="text-xs text-violet-600/70">Click to add to your technical skills</p>
                </div>
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-900"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Regenerate
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => {
                  const isAdded = technicalSkills.some(
                    (s) => s.label.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isAdded && handleAddSuggestion(suggestion)}
                      disabled={isAdded}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isAdded
                          ? 'cursor-not-allowed bg-violet-200/50 text-violet-400'
                          : 'cursor-pointer border border-violet-300 bg-white text-violet-800 shadow-sm hover:border-violet-400 hover:bg-violet-50'
                      }`}
                    >
                      {isAdded ? '✓ ' : '+ '}
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technical Skills Section */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Your Technical Skills</h3>
            <div className="min-h-[80px] rounded-lg border-2 border-slate-200 bg-white p-3">
              {technicalSkills.length === 0 ? (
                <div className="flex h-[80px] items-center justify-center text-center">
                  <p className="text-sm text-slate-400">
                    No skills added yet. Click suggestions above or add your own.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill, index) => (
                    <button
                      key={`${skill.type}-${index}`}
                      type="button"
                      onClick={() => removeTechnicalSkill(skill)}
                      className="group inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-slate-800"
                    >
                      <span>{skill.label}</span>
                      <svg
                        className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Skill Input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a custom skill..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-md bg-slate-700 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>

          {/* Soft Skills Section */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-amber-900">
              Soft Skills & Interpersonal Abilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {SOFT_SKILL_OPTIONS.map((skill) => {
                const isSelected = data.skills.soft.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSoftSkill(skill)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'border border-amber-300 bg-white text-amber-800 hover:border-amber-400 hover:bg-amber-100'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Languages Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-blue-900">Languages</h3>
            <div className="space-y-2">
              {data.skills.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    placeholder="e.g., English, Spanish"
                    className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                    className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="native">Native</option>
                    <option value="fluent">Fluent</option>
                    <option value="professional">Professional</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="basic">Basic</option>
                  </select>
                  {data.skills.languages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
                      title="Remove language"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLanguage}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Language
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
