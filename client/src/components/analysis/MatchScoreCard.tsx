interface MatchScoreCardProps {
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  loading: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

export default function MatchScoreCard({
  matchPercentage,
  strengths,
  weaknesses,
  loading,
}: MatchScoreCardProps) {
  if (loading) {
    return (
      <div
        data-testid="match-loading"
        className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
      >
        <div className="mb-4 h-6 w-40 rounded bg-gray-200" />
        <div className="mb-6 h-16 w-24 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Match Score
      </h2>

      <div
        className={`mb-6 inline-flex items-center rounded-lg px-4 py-3 ${getScoreBg(matchPercentage)}`}
      >
        <span className={`text-4xl font-bold ${getScoreColor(matchPercentage)}`}>
          {matchPercentage}%
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-green-700">
            Strengths
          </h3>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className="mr-1 text-green-500">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-red-700">
            Weaknesses
          </h3>
          <ul className="space-y-1">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className="mr-1 text-red-500">-</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
