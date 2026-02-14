import type { ResumeFormData, Language } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
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
];

const emptyLanguage: Language = { name: '', proficiency: 'basic' };

export default function SkillsStep({ data, onChange }: Props) {
  const toggleSoftSkill = (skill: string) => {
    const current = data.softSkills;
    const updated = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    onChange({ ...data, softSkills: updated });
  };

  const updateLanguage = (
    index: number,
    field: keyof Language,
    value: string
  ) => {
    const updated = data.languages.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    );
    onChange({ ...data, languages: updated });
  };

  const addLanguage = () => {
    onChange({ ...data, languages: [...data.languages, { ...emptyLanguage }] });
  };

  const removeLanguage = (index: number) => {
    onChange({
      ...data,
      languages: data.languages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Skills</h2>

      <div>
        <label
          htmlFor="technicalSkills"
          className="block text-sm font-medium text-gray-700"
        >
          Technical Skills
        </label>
        <input
          id="technicalSkills"
          type="text"
          value={data.technicalSkills}
          onChange={(e) =>
            onChange({ ...data, technicalSkills: e.target.value })
          }
          placeholder="e.g. React, TypeScript, Python, SQL, Git"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">Soft Skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOFT_SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSoftSkill(skill)}
              className={`rounded-full px-3 py-1 text-sm ${
                data.softSkills.includes(skill)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">Languages</p>
        <div className="mt-2 space-y-2">
          {data.languages.map((lang, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={lang.name}
                onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                placeholder="Language"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={lang.proficiency}
                onChange={(e) =>
                  updateLanguage(index, 'proficiency', e.target.value)
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="native">Native</option>
                <option value="fluent">Fluent</option>
                <option value="intermediate">Intermediate</option>
                <option value="basic">Basic</option>
              </select>
              {data.languages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLanguage}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Language
          </button>
        </div>
      </div>
    </div>
  );
}
