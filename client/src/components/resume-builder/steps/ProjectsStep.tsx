import type { ResumeFormData, Project } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyProject: Project = {
  name: '',
  description: '',
  technologies: '',
  role: '',
};

export default function ProjectsStep({ data, onChange }: Props) {
  const updateEntry = (index: number, field: keyof Project, value: string) => {
    const updated = data.projects.map((proj, i) =>
      i === index ? { ...proj, [field]: value } : proj
    );
    onChange({ ...data, projects: updated });
  };

  const addEntry = () => {
    onChange({ ...data, projects: [...data.projects, { ...emptyProject }] });
  };

  const removeEntry = (index: number) => {
    onChange({
      ...data,
      projects: data.projects.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
      <p className="text-sm text-gray-600">
        Showcase 2-3 relevant projects to demonstrate your skills.
      </p>

      {data.projects.length === 0 && (
        <p className="text-sm italic text-gray-500">No projects added yet.</p>
      )}

      {data.projects.map((proj, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Project #{index + 1}
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
              <label htmlFor={`projName-${index}`} className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                id={`projName-${index}`}
                type="text"
                value={proj.name}
                onChange={(e) => updateEntry(index, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`projRole-${index}`} className="block text-sm font-medium text-gray-700">
                Your Role
              </label>
              <input
                id={`projRole-${index}`}
                type="text"
                value={proj.role}
                onChange={(e) => updateEntry(index, 'role', e.target.value)}
                placeholder="e.g. Lead Developer"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`projTech-${index}`} className="block text-sm font-medium text-gray-700">
                Technologies
              </label>
              <input
                id={`projTech-${index}`}
                type="text"
                value={proj.technologies}
                onChange={(e) => updateEntry(index, 'technologies', e.target.value)}
                placeholder="e.g. React, Node.js, PostgreSQL"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={`projLink-${index}`} className="block text-sm font-medium text-gray-700">
                Link (optional)
              </label>
              <input
                id={`projLink-${index}`}
                type="url"
                value={proj.link || ''}
                onChange={(e) => updateEntry(index, 'link', e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`projDesc-${index}`} className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id={`projDesc-${index}`}
              rows={2}
              value={proj.description}
              onChange={(e) => updateEntry(index, 'description', e.target.value)}
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
        + Add Project
      </button>
    </div>
  );
}
