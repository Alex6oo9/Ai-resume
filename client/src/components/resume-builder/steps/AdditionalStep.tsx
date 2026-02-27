import type { ResumeFormData } from '../../../types';
import ProjectsStep from './ProjectsStep';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

export default function AdditionalStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Information
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Add projects, certifications, and extracurricular activities (optional)
        </p>
      </div>

      {/* Projects section — embedded from ProjectsStep */}
      <ProjectsStep data={data} onChange={onChange} />

      <div className="border-t border-gray-100" />

      <div>
        <label
          htmlFor="certifications"
          className="block text-sm font-medium text-gray-700"
        >
          Certifications (optional)
        </label>
        <textarea
          id="certifications"
          rows={3}
          value={data.certifications || ''}
          onChange={(e) =>
            onChange({ ...data, certifications: e.target.value })
          }
          placeholder="e.g., AWS Cloud Practitioner, Google Analytics Certified, PMP"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          List relevant certifications, separated by commas
        </p>
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
          rows={3}
          value={data.extracurriculars || ''}
          onChange={(e) =>
            onChange({ ...data, extracurriculars: e.target.value })
          }
          placeholder="e.g., President of Computer Science Club, Hackathon organizer, Volunteer tutor"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          List leadership roles, volunteer work, or club activities
        </p>
      </div>
    </div>
  );
}
