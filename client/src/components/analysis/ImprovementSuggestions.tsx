import type { DetailedImprovements } from '../../types';

interface ImprovementSuggestionsProps {
  suggestions: string[];
  detailed: DetailedImprovements | null;
  loading: boolean;
  onAnalyze: () => void;
}

export default function ImprovementSuggestions({
  suggestions,
  detailed,
  loading,
  onAnalyze,
}: ImprovementSuggestionsProps) {
  if (loading) {
    return (
      <div
        data-testid="improvements-loading"
        className="animate-pulse rounded-lg border border-border bg-card p-6"
      >
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
          <div className="h-4 w-4/6 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Improvement Suggestions
      </h2>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-foreground">
            General Suggestions
          </h3>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="mr-1 text-indigo-500">&#8226;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!detailed && (
        <button
          onClick={onAnalyze}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Get Detailed Suggestions
        </button>
      )}

      {detailed && (
        <div className="mb-4">
          <button
            onClick={onAnalyze}
            className="rounded-md border border-indigo-600 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          >
            Regenerate Suggestions
          </button>
        </div>
      )}

      {detailed && (
        <div className="space-y-4">
          {detailed.actionVerbs.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Action Verbs
              </h3>
              <ul className="space-y-1">
                {detailed.actionVerbs.map((v, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <span className="text-red-400 line-through">{v.current}</span>
                    {' → '}
                    <span className="font-medium text-green-700 dark:text-green-400">{v.suggested}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailed.quantifiedAchievements.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Quantified Achievements
              </h3>
              <ul className="space-y-1">
                {detailed.quantifiedAchievements.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {a.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailed.missingSections.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Missing Sections
              </h3>
              <ul className="space-y-1">
                {detailed.missingSections.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailed.keywordOptimization.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Keyword Optimization
              </h3>
              <ul className="space-y-1">
                {detailed.keywordOptimization.map((k, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <span className="font-medium text-indigo-600">{k.keyword}</span>
                    {' — '}
                    {k.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailed.formattingIssues.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">
                Formatting Issues
              </h3>
              <ul className="space-y-1">
                {detailed.formattingIssues.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
