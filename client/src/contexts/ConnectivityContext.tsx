import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface ConnectivityState {
  isServerDown: boolean;
  isServerDegraded: boolean;
  retryCount: number;
  manualRetry: () => void;
}

const ConnectivityContext = createContext<ConnectivityState>({
  isServerDown: false,
  isServerDegraded: false,
  retryCount: 0,
  manualRetry: () => {},
});

export function useConnectivity() {
  return useContext(ConnectivityContext);
}

const POLL_INTERVAL_MS = 10_000;

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [isServerDown, setIsServerDown] = useState(false);
  const [isServerDegraded, setIsServerDegraded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);

  const clearPoll = () => {
    if (pollTimerRef.current !== null) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'healthy' || data.status === 'ok';
    } catch {
      return false;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    const poll = async () => {
      const healthy = await checkHealth();
      if (healthy) {
        isPollingRef.current = false;
        setIsServerDown(false);
        setIsServerDegraded(false);
        setRetryCount(0);
        // Dispatch a custom event so components can show "server is back" toast
        window.dispatchEvent(new CustomEvent('server:recovered'));
      } else {
        setRetryCount((c) => c + 1);
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [checkHealth]);

  const manualRetry = useCallback(async () => {
    clearPoll();
    isPollingRef.current = false;
    const healthy = await checkHealth();
    if (healthy) {
      setIsServerDown(false);
      setIsServerDegraded(false);
      setRetryCount(0);
      window.dispatchEvent(new CustomEvent('server:recovered'));
    } else {
      setRetryCount((c) => c + 1);
      startPolling();
    }
  }, [checkHealth, startPolling]);

  useEffect(() => {
    const onDown = () => {
      setIsServerDown(true);
      startPolling();
    };
    const onError = () => {
      setIsServerDegraded(true);
    };
    const onUp = () => {
      setIsServerDown(false);
      setIsServerDegraded(false);
      clearPoll();
      isPollingRef.current = false;
    };

    window.addEventListener('server:down', onDown);
    window.addEventListener('server:error', onError);
    window.addEventListener('server:up', onUp);

    return () => {
      window.removeEventListener('server:down', onDown);
      window.removeEventListener('server:error', onError);
      window.removeEventListener('server:up', onUp);
      clearPoll();
    };
  }, [startPolling]);

  return (
    <ConnectivityContext.Provider value={{ isServerDown, isServerDegraded, retryCount, manualRetry }}>
      {children}
    </ConnectivityContext.Provider>
  );
}
