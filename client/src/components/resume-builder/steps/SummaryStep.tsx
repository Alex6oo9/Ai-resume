import { useState } from 'react';
import type { ResumeFormData } from '../../../types';
import { apiClient } from '../../../utils/api';

interface Props {
  data: ResumeFormData;
  onChange: (data: ResumeFormData) => void;
}

export default function SummaryStep({ data, onChange }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = data.professionalSummary || '';
  const charCount = summary.length;
  const minChars = 100;
  const maxChars = 500;

  const handleGenerateSummary = async () => {
    // Only generate if field is empty
    if (summary.trim()) {
      const confirmed = window.confirm(
        'This will replace your existing summary. Are you sure you want to continue?'
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare payload with only required fields for AI context
      const payload = {
        targetRole: data.targetRole,
        targetIndustry: data.targetIndustry,
        targetCountry: data.targetCountry,
        education: data.education.map((edu) => ({
          degree: edu.degreeType,
          field: edu.major,
          institution: edu.university,
        })),
        experience: data.experience.map((exp) => ({
          position: exp.role,
          company: exp.company,
          type: exp.type,
        })),
        projects: data.projects.map((proj) => ({
          name: proj.name,
        })),
        skills: {
          technical: data.skills.technical,
        },
      };

      const response = await apiClient.post<{ summary: string }>(
        '/ai/generate-summary',
        payload
      );

      onChange({
        ...data,
        professionalSummary: response.data.summary,
      });
    } catch (err: any) {
      console.error('Failed to generate summary:', err);
      setError(
        err.response?.data?.error ||
          'Failed to generate summary. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (value: string) => {
    // Enforce max character limit
    if (value.length <= maxChars) {
      onChange({ ...data, professionalSummary: value });
      setError(null);
    }
  };

  const isValid = charCount >= minChars && charCount <= maxChars;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Professional Summary
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Write a brief professional summary highlighting your education, skills,
          and career goals. Or let AI generate one for you based on your resume
          data.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="professionalSummary"
            className="block text-sm font-medium text-gray-700"
          >
            Summary <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>

        <textarea
          id="professionalSummary"
          rows={6}
          value={summary}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g., Recent Computer Science graduate from XYZ University with hands-on experience in full-stack development. Proficient in JavaScript, React, and Node.js with demonstrated ability to build scalable web applications. Seeking Junior Software Engineer position to leverage technical skills and contribute to innovative projects in the Technology industry."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <span
              className={`font-medium ${
                charCount < minChars
                  ? 'text-red-600'
                  : isValid
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            >
              {charCount}
            </span>
            <span className="text-gray-500"> / {maxChars} characters</span>
          </div>

          {charCount > 0 && charCount < minChars && (
            <span className="text-red-600">
              Minimum {minChars} characters required
            </span>
          )}

          {charCount === maxChars && (
            <span className="text-gray-500">Maximum length reached</span>
          )}
        </div>

        {error && (
          <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="mt-2 text-sm text-gray-500">
          AI will generate a 2-3 sentence summary based on your education,
          experience, skills, and target role. You can edit it after generation.
        </p>
      </div>
    </div>
  );
}
