import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const toast = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {msg && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur">
            <Check size={16} strokeWidth={2.6} className="text-brand-accent" />
            {msg}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve estar dentro de ToastProvider');
  return ctx;
}
