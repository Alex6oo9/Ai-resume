export type UploadStatus =
  | 'uploading'
  | 'parsing'
  | 'analyzing'
  | 'success'
  | 'error';

interface UploadProgressProps {
  status: UploadStatus;
  errorMessage?: string;
}

const statusConfig: Record<
  UploadStatus,
  { label: string; icon: 'spinner' | 'check' | 'error' }
> = {
  uploading: { label: 'Uploading your resume...', icon: 'spinner' },
  parsing: { label: 'Parsing PDF content...', icon: 'spinner' },
  analyzing: { label: 'Analyzing with AI...', icon: 'spinner' },
  success: { label: 'Analysis complete!', icon: 'check' },
  error: { label: 'Something went wrong', icon: 'error' },
};

function Spinner() {
  return (
    <svg
      className="h-6 w-6 animate-spin text-blue-600"
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-6 w-6 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="h-6 w-6 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function UploadProgress({
  status,
  errorMessage,
}: UploadProgressProps) {
  const config = statusConfig[status];
  const displayMessage =
    status === 'error' ? errorMessage || config.label : config.label;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-4 ${
        status === 'success'
          ? 'bg-green-50'
          : status === 'error'
            ? 'bg-red-50'
            : 'bg-blue-50'
      }`}
    >
      {config.icon === 'spinner' && <Spinner />}
      {config.icon === 'check' && <CheckIcon />}
      {config.icon === 'error' && <ErrorIcon />}
      <p
        className={`text-sm font-medium ${
          status === 'success'
            ? 'text-green-800'
            : status === 'error'
              ? 'text-red-800'
              : 'text-blue-800'
        }`}
      >
        {displayMessage}
      </p>
    </div>
  );
}
