import { motion } from 'framer-motion';

const STEPS = [
  { title: 'Personal Info' },
  { title: 'Education' },
  { title: 'Experience' },
  { title: 'Skills' },
  { title: 'Summary' },
  { title: 'Additional' },
];

interface Props {
  currentStep: number;
  completedSteps: Set<number>;
  hasFinished: boolean;
  onStepClick: (index: number) => void;
  onOpen: () => void;
  onLogoClick: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export default function ClosedPanel({
  currentStep,
  completedSteps,
  hasFinished,
  onStepClick,
  onOpen,
  onLogoClick,
}: Props) {
  return (
    <motion.div
      key="closed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header (72px) */}
      <div className="flex-none h-[72px] px-3 lg:px-4 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center justify-between gap-2">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <svg
            className="h-5 w-5 flex-shrink-0 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 2l2 2-2 2"
              stroke="#7c3aed"
              strokeWidth={1.5}
            />
          </svg>
          <span className="hidden lg:block text-base font-bold text-primary">ProResumeAI</span>
        </button>

        {/* Expand chevron (desktop only) */}
        <button
          onClick={onOpen}
          aria-label="Expand panel"
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto py-8 px-0 lg:px-6">
        <div className="flex flex-col items-center lg:items-start">
          {STEPS.map((step, index) => {
            const isCompleted = hasFinished ? true : completedSteps.has(index);
            const isActive = !hasFinished && index === currentStep;

            let circleClass =
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold border-2 transition-all duration-200 ';
            if (isActive && isCompleted) {
              circleClass +=
                'border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]';
            } else if (isActive) {
              circleClass +=
                'border-primary bg-background text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]';
            } else if (isCompleted) {
              circleClass += 'border-primary bg-primary text-primary-foreground';
            } else {
              circleClass +=
                'border-border bg-background text-muted-foreground group-hover:border-foreground/30';
            }

            return (
              <div key={step.title} className="flex flex-col items-center lg:items-start w-full">
                <button
                  onClick={() => onStepClick(index)}
                  className="group flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors focus:outline-none"
                  aria-label={step.title}
                >
                  <div className={`mx-auto lg:mx-0 ${circleClass}`}>
                    {isCompleted && !isActive ? (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`hidden lg:block text-sm font-medium truncate transition-colors ${
                      isActive
                        ? 'text-primary font-semibold'
                        : isCompleted
                        ? 'text-primary/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connecting line */}
                {index < STEPS.length - 1 && (
                  <div className="flex items-center justify-center w-full pl-0 lg:pl-[22px] my-0.5">
                    <div className="w-0.5 h-6 lg:h-8 bg-border overflow-hidden">
                      <div
                        className="bg-primary transition-all duration-300"
                        style={{ height: isCompleted ? '100%' : '0%', width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: expand button */}
      <div className="flex-none h-14 border-t border-border flex items-center justify-center">
        <button
          onClick={onOpen}
          aria-label="Expand panel"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
