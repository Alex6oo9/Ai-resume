import { useEffect, useRef } from 'react';
import { useConnectivity } from '../../contexts/ConnectivityContext';

interface ServerDownBannerProps {
  onRecovered?: () => void;
}

export default function ServerDownBanner({ onRecovered }: ServerDownBannerProps) {
  const { isServerDown, isServerDegraded, retryCount, manualRetry } = useConnectivity();
  const recoveredRef = useRef(onRecovered);
  recoveredRef.current = onRecovered;

  useEffect(() => {
    const handler = () => recoveredRef.current?.();
    window.addEventListener('server:recovered', handler);
    return () => window.removeEventListener('server:recovered', handler);
  }, []);

  if (!isServerDown && !isServerDegraded) return null;

  return (
    <div
      role="alert"
      className={`sticky top-0 z-[9999] flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium ${
        isServerDown
          ? 'bg-red-600 text-white'
          : 'bg-yellow-500 text-yellow-950'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span aria-hidden="true">{isServerDown ? '🔴' : '🟡'}</span>
        <span className="truncate">
          {isServerDown
            ? `Unable to reach the server. Retrying automatically${retryCount > 0 ? ` (attempt ${retryCount})` : ''}…`
            : 'Server is experiencing issues. Some features may be unavailable.'}
        </span>
      </div>
      {isServerDown && (
        <button
          onClick={manualRetry}
          className="shrink-0 rounded border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          Retry now
        </button>
      )}
    </div>
  );
}
