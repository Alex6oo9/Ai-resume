interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const status =
            index < currentStep
              ? 'completed'
              : index === currentStep
                ? 'current'
                : 'upcoming';

          return (
            <li
              key={label}
              className="flex flex-1 items-center"
              data-testid={`step-${index}`}
              data-status={status}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    status === 'completed'
                      ? 'bg-green-600 text-white'
                      : status === 'current'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {status === 'completed' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs ${
                    status === 'current'
                      ? 'font-medium text-blue-600'
                      : status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
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
