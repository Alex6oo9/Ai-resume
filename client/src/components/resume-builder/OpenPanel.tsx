import { motion } from 'framer-motion';
import StepIndicator from './StepIndicator';
import UploadProgress, { UploadStatus } from '../resume-upload/UploadProgress';

interface Props {
  // header
  onLogoClick: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onClose: () => void;
  // form
  steps: string[];
  currentStep: number;
  completedSteps: Set<number>;
  stepComponents: React.ReactNode[];
  stepErrors: string[];
  isLastStep: boolean;
  status: UploadStatus | null;
  errorMessage: string;
  onStepClick: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function OpenPanel({
  onLogoClick,
  dark,
  onToggleDark,
  onClose,
  steps,
  currentStep,
  completedSteps,
  stepComponents,
  stepErrors,
  isLastStep,
  status,
  errorMessage,
  onStepClick,
  onNext,
  onBack,
  onSubmit,
}: Props) {
  return (
    <motion.div
      key="open"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header (72px) */}
      <div className="flex-none h-[72px] px-6 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center justify-between gap-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
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
          <span className="text-base font-bold text-primary">ProResumeAI</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Collapse panel (chevron-left) */}
          <button
            onClick={onClose}
            aria-label="Collapse panel"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-card custom-scrollbar px-6 py-8 md:px-10">
        {/* Step Indicator */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={onStepClick}
        />

        {/* Validation Errors */}
        {stepErrors.length > 0 && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Please fix the following {stepErrors.length === 1 ? 'error' : 'errors'}:
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                  {stepErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-[1.5rem] border border-border bg-background p-6 shadow-sm transition-all hover:border-primary/30">
          {stepComponents.map((step, index) => (
            <div
              key={index}
              style={{ display: currentStep === index ? '' : 'none' }}
              aria-hidden={currentStep !== index}
            >
              {step}
            </div>
          ))}

          {/* Nav Buttons */}
          <div className="mt-6 flex justify-between">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={status !== null && status !== 'error'}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'uploading' ? 'Saving...' : 'Finish & View'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4">
            <UploadProgress status={status} errorMessage={errorMessage} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
