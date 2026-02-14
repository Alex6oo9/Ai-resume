import type { ResumeFormData } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

export default function TargetRoleStep({ data, onChange }: Props) {
  const update = (field: keyof ResumeFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Target Role</h2>
      <p className="text-sm text-gray-600">
        What position are you applying for? This helps the AI tailor your resume.
      </p>

      <div>
        <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
          Target Role
        </label>
        <input
          id="targetRole"
          type="text"
          value={data.targetRole}
          onChange={(e) => update('targetRole', e.target.value)}
          placeholder="e.g. Frontend Developer"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-700">
          Target Country
        </label>
        <input
          id="targetCountry"
          type="text"
          value={data.targetCountry}
          onChange={(e) => update('targetCountry', e.target.value)}
          placeholder="e.g. United States"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="targetCity" className="block text-sm font-medium text-gray-700">
          Target City (optional)
        </label>
        <input
          id="targetCity"
          type="text"
          value={data.targetCity || ''}
          onChange={(e) => update('targetCity', e.target.value)}
          placeholder="e.g. San Francisco"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
