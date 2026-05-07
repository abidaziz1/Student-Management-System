import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm min-w-[280px] max-w-[400px] animate-in
        ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
