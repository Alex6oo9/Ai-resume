import type { ResumeFormData, Experience } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyExperience: Experience = {
  type: 'internship',
  company: '',
  role: '',
  duration: '',
  responsibilities: '',
  industry: '',
};

export default function ExperienceStep({ data, onChange }: Props) {
  const updateEntry = (index: number, field: keyof Experience, value: string) => {
    const updated = data.experience.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, experience: updated });
  };

  const addEntry = () => {
    onChange({
      ...data,
      experience: [...data.experience, { ...emptyExperience }],
    });
  };

  const removeEntry = (index: number) => {
    onChange({
      ...data,
      experience: data.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
      <p className="text-sm text-gray-600">
        Add internships, part-time jobs, or volunteer work. This section is optional for fresh graduates.
      </p>

      {data.experience.length === 0 && (
        <p className="text-sm italic text-gray-500">No experience added yet.</p>
      )}

      {data.experience.map((exp, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Experience #{index + 1}
            </h3>
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`expType-${index}`} className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id={`expType-${index}`}
                value={exp.type}
                onChange={(e) => updateEntry(index, 'type', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
                <option value="freelance">Freelance</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">
                Company / Organization
              </label>
              <input
                id={`company-${index}`}
                type="text"
                value={exp.company}
                onChange={(e) => updateEntry(index, 'company', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`industry-${index}`} className="block text-sm font-medium text-gray-700">
                Industry (optional)
              </label>
              <input
                id={`industry-${index}`}
                type="text"
                value={exp.industry || ''}
                onChange={(e) => updateEntry(index, 'industry', e.target.value)}
                placeholder="e.g., Technology, Finance"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                id={`role-${index}`}
                type="text"
                value={exp.role}
                onChange={(e) => updateEntry(index, 'role', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`duration-${index}`} className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <input
                id={`duration-${index}`}
                type="text"
                value={exp.duration}
                onChange={(e) => updateEntry(index, 'duration', e.target.value)}
                placeholder="e.g. Jun 2023 - Aug 2023"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`responsibilities-${index}`} className="block text-sm font-medium text-gray-700">
              Key Responsibilities
            </label>
            <textarea
              id={`responsibilities-${index}`}
              rows={3}
              value={exp.responsibilities}
              onChange={(e) => updateEntry(index, 'responsibilities', e.target.value)}
              placeholder="Describe your key responsibilities and achievements..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
      >
        + Add Experience
      </button>
    </div>
  );
}
