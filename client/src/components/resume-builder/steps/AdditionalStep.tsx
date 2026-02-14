import type { ResumeFormData } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

export default function AdditionalStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Additional Information
      </h2>

      <div>
        <label
          htmlFor="professionalSummary"
          className="block text-sm font-medium text-gray-700"
        >
          Professional Summary
        </label>
        <textarea
          id="professionalSummary"
          rows={3}
          value={data.professionalSummary}
          onChange={(e) =>
            onChange({ ...data, professionalSummary: e.target.value })
          }
          placeholder="Write 2-3 sentences summarizing your background, skills, and career goals..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="certifications"
          className="block text-sm font-medium text-gray-700"
        >
          Certifications (optional)
        </label>
        <textarea
          id="certifications"
          rows={2}
          value={data.certifications || ''}
          onChange={(e) =>
            onChange({ ...data, certifications: e.target.value })
          }
          placeholder="e.g. AWS Cloud Practitioner, Google Analytics Certified"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="extracurriculars"
          className="block text-sm font-medium text-gray-700"
        >
          Extracurricular Activities (optional)
        </label>
        <textarea
          id="extracurriculars"
          rows={2}
          value={data.extracurriculars || ''}
          onChange={(e) =>
            onChange({ ...data, extracurriculars: e.target.value })
          }
          placeholder="e.g. President of CS Club, Hackathon organizer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
