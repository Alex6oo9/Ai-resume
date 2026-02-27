interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps?: Set<number>;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="mb-6" aria-label="Form progress">
      <ol className="flex items-start">
        {steps.map((label, index) => {
          const isCompleted = completedSteps ? completedSteps.has(index) : index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && !isCurrent;

          return (
            <li key={label} className="flex flex-1 items-start" data-testid={`step-${index}`} data-status={isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'}>
              {/* Circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Circle */}
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold
                    transition-all duration-200
                    ${isCurrent
                      ? 'bg-blue-600 text-white ring-[3px] ring-offset-2 ring-blue-500'
                      : isCompleted
                        ? 'bg-blue-600 text-white group-hover:bg-blue-700 group-hover:scale-105'
                        : 'bg-white text-gray-400 ring-2 ring-gray-200'
                    }
                  `}
                >
                  {isCompleted && !isCurrent ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                        ? 'text-blue-500 group-hover:text-blue-700'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {label}
                </span>
              </button>

              {/* Connector — mt-4 aligns it with circle center (h-8 = 32px, center = 16px ≈ mt-4) */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-1 mt-4 h-0.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-blue-600 transition-all duration-300 ${
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
