"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (text: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

const ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
  info: "\u2139",
};

const COLORS: Record<ToastType, string> = {
  success: "text-green-400 bg-green-400/10 border-green-400/20",
  error: "text-red-400 bg-red-400/10 border-red-400/20",
  info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastType = "info", duration: number = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-2xl shadow-2xl ${COLORS[toast.type]}`}
    >
      <span className="text-sm font-bold">{ICONS[toast.type]}</span>
      <span className="text-xs font-medium text-white/80">{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-2 text-white/20 hover:text-white/40 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
