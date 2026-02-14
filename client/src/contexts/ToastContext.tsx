import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToastContext() {
  return useContext(ToastContext);
}
