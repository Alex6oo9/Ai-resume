interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export default function ConfirmLeaveModal({ isOpen, onConfirm, onCancel, message = 'You have unsaved changes. Leaving now will discard your resume data.' }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-leave-title"
    >
      <div className="w-full max-w-sm mx-4 bg-card text-card-foreground border border-border rounded-xl shadow-xl p-6">
        <h2 id="confirm-leave-title" className="text-lg font-semibold text-foreground mb-2">
          Leave page?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
          >
            Leave anyway
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Keep editing
          </button>
        </div>
      </div>
    </div>
  );
}
