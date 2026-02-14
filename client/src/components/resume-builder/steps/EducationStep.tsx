import type { ResumeFormData, Education } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

const emptyEducation: Education = {
  degreeType: '',
  major: '',
  university: '',
  graduationDate: '',
  relevantCoursework: '',
};

export default function EducationStep({ data, onChange }: Props) {
  const updateEntry = (index: number, field: keyof Education, value: string) => {
    const updated = data.education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    onChange({ ...data, education: updated });
  };

  const addEntry = () => {
    onChange({ ...data, education: [...data.education, { ...emptyEducation }] });
  };

  const removeEntry = (index: number) => {
    onChange({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Education</h2>

      {data.education.map((edu, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Education #{index + 1}
            </h3>
            {data.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`degreeType-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Degree Type
              </label>
              <input
                id={`degreeType-${index}`}
                type="text"
                value={edu.degreeType}
                onChange={(e) => updateEntry(index, 'degreeType', e.target.value)}
                placeholder="e.g. Bachelor of Science"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor={`major-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Major / Field of Study
              </label>
              <input
                id={`major-${index}`}
                type="text"
                value={edu.major}
                onChange={(e) => updateEntry(index, 'major', e.target.value)}
                placeholder="e.g. Computer Science"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor={`university-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                University
              </label>
              <input
                id={`university-${index}`}
                type="text"
                value={edu.university}
                onChange={(e) => updateEntry(index, 'university', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor={`graduationDate-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Graduation Date
              </label>
              <input
                id={`graduationDate-${index}`}
                type="month"
                value={edu.graduationDate}
                onChange={(e) => updateEntry(index, 'graduationDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor={`gpa-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                GPA (optional)
              </label>
              <input
                id={`gpa-${index}`}
                type="text"
                value={edu.gpa || ''}
                onChange={(e) => updateEntry(index, 'gpa', e.target.value)}
                placeholder="e.g. 3.8"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor={`honors-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Honors (optional)
              </label>
              <input
                id={`honors-${index}`}
                type="text"
                value={edu.honors || ''}
                onChange={(e) => updateEntry(index, 'honors', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`coursework-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Relevant Coursework
            </label>
            <input
              id={`coursework-${index}`}
              type="text"
              value={edu.relevantCoursework}
              onChange={(e) => updateEntry(index, 'relevantCoursework', e.target.value)}
              placeholder="e.g. Data Structures, Algorithms, Web Development"
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
        + Add Education
      </button>
    </div>
  );
}
