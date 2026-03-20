interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps?: Set<number>;
  onStepClick?: (step: number) => void;
  mode?: 'horizontal' | 'vertical';
  onExpandPanel?: () => void;
}

// Step icons for vertical mode
const STEP_ICONS = [
  // Person
  <svg key="0" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>,
  // Academic cap
  <svg key="1" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>,
  // Briefcase
  <svg key="2" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  // Lightning bolt (skills)
  <svg key="3" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  // Document text (summary)
  <svg key="4" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
  // Plus circle (additional)
  <svg key="5" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
];

export default function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  mode = 'horizontal',
  onExpandPanel,
}: StepIndicatorProps) {
  if (mode === 'vertical') {
    return (
      <nav className="flex flex-col items-center gap-1 py-4" aria-label="Form progress">
        <ol className="flex flex-col items-center gap-1 w-full">
          {steps.map((label, index) => {
            const isCompleted = completedSteps ? completedSteps.has(index) : index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = isCompleted && !isCurrent;

            return (
              <li
                key={label}
                className="relative flex flex-col items-center w-full"
                data-testid={`step-${index}`}
                data-status={isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'}
              >
                {/* Connecting line above (except first) */}
                {index > 0 && (
                  <div className="lg:absolute lg:-top-1 lg:left-1/2 lg:-translate-x-1/2 hidden lg:block w-0.5 h-1 bg-border" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      onExpandPanel?.();
                      onStepClick?.(index);
                    }
                  }}
                  disabled={!isClickable && !isCurrent}
                  title={label}
                  className={`flex flex-col items-center gap-1 w-full px-1 py-1.5 rounded-lg transition-all duration-200 focus:outline-none group ${
                    isClickable ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'
                  }`}
                >
                  {/* Circle with icon */}
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full
                      transition-all duration-200
                      ${isCurrent
                        ? 'bg-primary text-primary-foreground ring-[3px] ring-offset-2 ring-primary/50'
                        : isCompleted
                          ? 'bg-primary text-primary-foreground group-hover:scale-105'
                          : 'bg-muted text-muted-foreground ring-2 ring-border'
                      }
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      STEP_ICONS[index] ?? <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Label — hidden on mobile, shown on desktop */}
                  <span
                    className={`
                      hidden lg:block text-[9px] font-medium leading-tight text-center
                      transition-colors duration-200 max-w-[60px] break-words
                      ${isCurrent
                        ? 'text-primary font-semibold'
                        : isCompleted
                          ? 'text-primary/70'
                          : 'text-muted-foreground'
                      }
                    `}
                  >
                    {label}
                  </span>
                </button>

                {/* Connecting line below (except last) */}
                {index < steps.length - 1 && (
                  <div
                    className={`hidden lg:block w-0.5 h-2 rounded-full transition-colors duration-300 ${
                      isCompleted ? 'bg-primary/40' : 'bg-border'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Horizontal mode (default)
  return (
    <nav
      className="bg-muted/20 px-4 py-1.5 custom-scrollbar overflow-x-auto"
      aria-label="Form progress"
    >
      <ol className="flex items-start min-w-max mx-auto">
        {steps.map((label, index) => {
          const isCompleted = completedSteps ? completedSteps.has(index) : index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && !isCurrent;

          return (
            <li
              key={label}
              className="flex flex-1 items-start"
              data-testid={`step-${index}`}
              data-status={isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'}
            >
              {/* Circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1 flex-shrink-0 focus:outline-none group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Circle */}
                <div
                  className={`
                    flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold
                    transition-all duration-200
                    ${isCurrent
                      ? 'bg-primary text-primary-foreground ring-[3px] ring-offset-2 ring-primary/50'
                      : isCompleted
                        ? 'bg-primary text-primary-foreground group-hover:scale-105'
                        : 'bg-card text-muted-foreground ring-2 ring-border'
                    }
                  `}
                >
                  {isCompleted && !isCurrent ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[10px] font-medium leading-tight text-center whitespace-nowrap
                    transition-colors duration-200
                    ${isCurrent
                      ? 'text-primary font-semibold'
                      : isCompleted
                        ? 'text-primary/70 group-hover:text-primary'
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {label}
                </span>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-1 mt-3.5 h-0.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-primary transition-all duration-300 ${
                      isCompleted ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
