"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, type ToastType } from "@/store/toast-store";

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        icon: "text-green-400",
        text: "text-green-300",
    },
    error: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: "text-red-400",
        text: "text-red-300",
    },
    info: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: "text-blue-400",
        text: "text-blue-300",
    },
};

const ICONS: Record<ToastType, string> = {
    success: "M4.5 12.75l6 6 9-13.5",
    error: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
};

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const colors = TOAST_COLORS[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 60, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl border ${colors.bg} ${colors.border} shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
                        >
                            <svg
                                className={`w-4 h-4 shrink-0 ${colors.icon}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[toast.type]} />
                            </svg>
                            <span className={`text-sm font-medium flex-1 ${colors.text}`}>
                                {toast.message}
                            </span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-white/20 hover:text-white/60 transition-colors shrink-0"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
