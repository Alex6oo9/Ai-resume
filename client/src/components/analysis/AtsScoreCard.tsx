import type { AtsScoreBreakdown } from '../../types';

interface AtsScoreCardProps {
  atsBreakdown: AtsScoreBreakdown | null;
  loading: boolean;
  onCalculate: () => void;
}

function ScoreDonut({ score }: { score: number }) {
  const r = 54;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" aria-label={`ATS score: ${score} out of 100`}>
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--donut-track, #e5e7eb)"
        strokeWidth="12"
      />
      {/* Foreground arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Center text */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="22"
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fill="currentColor"
        className="text-muted-foreground"
      >
        /100
      </text>
    </svg>
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
        className="animate-pulse rounded-lg border border-border bg-card p-6"
      >
        <div className="mb-4 h-6 w-36 rounded bg-muted" />
        <div className="mb-4 h-32 w-32 rounded-full bg-muted mx-auto" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!atsBreakdown) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          ATS Compatibility
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
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

  const subScores = [
    { label: 'Format Compliance', value: atsBreakdown.formatCompliance, max: 40 },
    { label: 'Keyword Match', value: atsBreakdown.keywordMatch, max: 40 },
    { label: 'Section Completeness', value: atsBreakdown.sectionCompleteness, max: 20 },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        ATS Compatibility
      </h2>

      <div className="mb-6 flex justify-center">
        <ScoreDonut score={atsBreakdown.totalScore} />
      </div>

      <div className="mb-6 space-y-2">
        {subScores.map(({ label, value, max }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400">
              {value}/{max}
            </span>
          </div>
        ))}
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
                className="rounded-full bg-green-100 dark:bg-green-950/40 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
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
                className="rounded-full bg-red-100 dark:bg-red-950/40 px-2 py-0.5 text-xs text-red-700 dark:text-red-400"
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
