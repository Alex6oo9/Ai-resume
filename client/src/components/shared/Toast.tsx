import { useEffect } from 'react';
import type { ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div
      role="alert"
      className={`${bgColor} animate-fade-in pointer-events-auto rounded-md px-4 py-3 text-sm text-white shadow-lg`}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
