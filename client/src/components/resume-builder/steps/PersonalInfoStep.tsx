import type { ResumeFormData, AdditionalLink } from '../../../types';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
  showPhotoUpload?: boolean;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Design',
  'Healthcare',
  'Education',
  'Engineering',
  'Consulting',
  'Retail',
  'Hospitality',
  'Other',
];

export default function PersonalInfoStep({ data, onChange, showPhotoUpload }: Props) {
  const update = (field: keyof ResumeFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addAdditionalLink = () => {
    const currentLinks = data.additionalLinks || [];
    if (currentLinks.length >= 3) return;

    const newLink: AdditionalLink = {
      id: Date.now().toString(),
      label: '',
      url: '',
    };

    update('additionalLinks', [...currentLinks, newLink]);
  };

  const removeAdditionalLink = (id: string) => {
    const currentLinks = data.additionalLinks || [];
    update(
      'additionalLinks',
      currentLinks.filter((link) => link.id !== id)
    );
  };

  const updateAdditionalLink = (id: string, field: 'label' | 'url', value: string) => {
    const currentLinks = data.additionalLinks || [];
    update(
      'additionalLinks',
      currentLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide your contact details and target position
        </p>
      </div>

      {/* Profile Photo — only shown for templates that support it */}
      {showPhotoUpload && <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
          <p className="text-xs text-gray-500">
            Optional · Displayed only on photo-supporting templates (e.g. Bold Accent)
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Preview */}
          {data.profilePhoto ? (
            <div className="relative flex-shrink-0">
              <img
                src={data.profilePhoto}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => update('profilePhoto', undefined)}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300 text-2xl text-gray-400">
              👤
            </div>
          )}

          <div>
            <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {data.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert('Image must be under 2MB');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    update('profilePhoto', ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP — max 2MB</p>
          </div>
        </div>
      </div>}

      {/* Basic Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Contact Details</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => update('email', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              value={data.city}
              onChange={(e) => update('city', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              id="country"
              type="text"
              value={data.country}
              onChange={(e) => update('country', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Target Position */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Target Position</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="targetRole"
              className="block text-sm font-medium text-gray-700"
            >
              Target Role <span className="text-red-500">*</span>
            </label>
            <input
              id="targetRole"
              type="text"
              value={data.targetRole}
              onChange={(e) => update('targetRole', e.target.value)}
              placeholder="e.g., Junior Data Analyst"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="targetIndustry"
              className="block text-sm font-medium text-gray-700"
            >
              Target Industry <span className="text-red-500">*</span>
            </label>
            <select
              id="targetIndustry"
              value={data.targetIndustry}
              onChange={(e) => update('targetIndustry', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="targetCountry"
              className="block text-sm font-medium text-gray-700"
            >
              Target Country <span className="text-red-500">*</span>
            </label>
            <input
              id="targetCountry"
              type="text"
              value={data.targetCountry}
              onChange={(e) => update('targetCountry', e.target.value)}
              placeholder="e.g., United States"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="targetCity"
              className="block text-sm font-medium text-gray-700"
            >
              Target City (optional)
            </label>
            <input
              id="targetCity"
              type="text"
              value={data.targetCity || ''}
              onChange={(e) => update('targetCity', e.target.value)}
              placeholder="e.g., San Francisco"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">
          Professional Links
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="linkedinUrl"
              className="block text-sm font-medium text-gray-700"
            >
              LinkedIn Profile
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={data.linkedinUrl || ''}
              onChange={(e) => update('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="portfolioUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Portfolio / Website
            </label>
            <input
              id="portfolioUrl"
              type="url"
              value={data.portfolioUrl || ''}
              onChange={(e) => update('portfolioUrl', e.target.value)}
              placeholder="https://yourportfolio.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Additional Links */}
        {data.additionalLinks && data.additionalLinks.length > 0 && (
          <div className="space-y-3">
            {data.additionalLinks.map((link, index) => (
              <div
                key={link.id}
                className="rounded-xl border border-blue-100 bg-blue-50/40 p-3"
              >
                <p className="text-xs font-medium text-blue-700/70 mb-2">
                  Additional Link {index + 1}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateAdditionalLink(link.id, 'label', e.target.value)}
                    placeholder="e.g. GitHub"
                    maxLength={30}
                    className="w-36 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="relative flex flex-1 min-w-0 items-center">
                    <svg
                      className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateAdditionalLink(link.id, 'url', e.target.value)}
                      placeholder="https://…"
                      className="block w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalLink(link.id)}
                    aria-label="Remove link"
                    className="flex-shrink-0 rounded-md px-2 py-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!data.additionalLinks || data.additionalLinks.length < 3) && (
          <button
            type="button"
            onClick={addAdditionalLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-blue-400 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another Link
          </button>
        )}
      </div>
    </div>
  );
}
