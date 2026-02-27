"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = "info", duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({
            toasts: [...s.toasts.slice(-4), { id, message, type, duration }], // Max 5
        }));
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
            }, duration);
        }
    },
    removeToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
}));
