import { useState, FormEvent } from 'react';

export interface TargetRoleData {
  targetRole: string;
  targetCountry: string;
  targetCity: string;
  jobDescription?: string;
}

interface TargetRoleFormProps {
  onSubmit: (data: TargetRoleData) => void;
  loading: boolean;
}

export default function TargetRoleForm({
  onSubmit,
  loading,
}: TargetRoleFormProps) {
  const [targetRole, setTargetRole] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [showJd, setShowJd] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const JD_MAX_LENGTH = 5000;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!targetRole.trim()) {
      newErrors.targetRole = 'Target role is required';
    }
    if (!targetCountry.trim()) {
      newErrors.targetCountry = 'Country is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      targetRole,
      targetCountry,
      targetCity,
      jobDescription: showJd ? jobDescription : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="targetRole"
          className="block text-sm font-medium text-gray-700"
        >
          Target Role
        </label>
        <input
          id="targetRole"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. Frontend Developer"
        />
        {errors.targetRole && (
          <p className="mt-1 text-sm text-red-600">{errors.targetRole}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="targetCountry"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <input
          id="targetCountry"
          type="text"
          value={targetCountry}
          onChange={(e) => setTargetCountry(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. United States"
        />
        {errors.targetCountry && (
          <p className="mt-1 text-sm text-red-600">{errors.targetCountry}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="targetCity"
          className="block text-sm font-medium text-gray-700"
        >
          City (optional)
        </label>
        <input
          id="targetCity"
          type="text"
          value={targetCity}
          onChange={(e) => setTargetCity(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. San Francisco"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowJd((prev) => !prev)}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          {showJd
            ? '− Hide job description'
            : '+ Add job description for better accuracy'}
        </button>

        {showJd && (
          <div className="mt-2">
            <label
              htmlFor="jobDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>
            <textarea
              id="jobDescription"
              rows={6}
              maxLength={JD_MAX_LENGTH}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Paste the job posting here…"
            />
            <p
              className={`mt-1 text-right text-xs ${
                jobDescription.length >= JD_MAX_LENGTH
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {jobDescription.length}/{JD_MAX_LENGTH}
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </button>
    </form>
  );
}
