import type { AtsScoreBreakdown } from '../../types';

interface AtsScoreCardProps {
  atsBreakdown: AtsScoreBreakdown | null;
  loading: boolean;
  onCalculate: () => void;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}/{max}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-indigo-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AtsScoreCard({
  atsBreakdown,
  loading,
  onCalculate,
}: AtsScoreCardProps) {
  if (loading) {
    return (
      <div
        data-testid="ats-loading"
        className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
      >
        <div className="mb-4 h-6 w-36 rounded bg-gray-200" />
        <div className="mb-4 h-16 w-20 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!atsBreakdown) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          ATS Compatibility
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Check how well your resume passes Applicant Tracking Systems.
        </p>
        <button
          onClick={onCalculate}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Calculate ATS Score
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        ATS Compatibility
      </h2>

      <div className="mb-6 inline-flex items-center rounded-lg bg-indigo-50 px-4 py-3">
        <span className="text-4xl font-bold text-indigo-600">
          {atsBreakdown.totalScore}
        </span>
        <span className="ml-1 text-sm text-indigo-500">/100</span>
      </div>

      <div className="mb-6">
        <ProgressBar
          value={atsBreakdown.formatCompliance}
          max={40}
          label="Format Compliance"
        />
        <ProgressBar
          value={atsBreakdown.keywordMatch}
          max={40}
          label="Keyword Match"
        />
        <ProgressBar
          value={atsBreakdown.sectionCompleteness}
          max={20}
          label="Section Completeness"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-green-700">
            Matched Keywords
          </h3>
          <div className="flex flex-wrap gap-1">
            {atsBreakdown.keywords.matched.map((k, i) => (
              <span
                key={i}
                className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-red-700">
            Missing Keywords
          </h3>
          <div className="flex flex-wrap gap-1">
            {atsBreakdown.keywords.missing.map((k, i) => (
              <span
                key={i}
                className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
