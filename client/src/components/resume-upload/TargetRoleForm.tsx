import { useState, FormEvent } from 'react';

export interface TargetRoleData {
  targetRole: string;
  targetCountry: string;
  targetCity: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    onSubmit({ targetRole, targetCountry, targetCity });
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
