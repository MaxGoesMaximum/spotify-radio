"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Ambient red glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-red-500/[0.04] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center"
        >
          <svg className="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Er ging iets mis</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar de homepagina.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
          >
            Opnieuw proberen
          </button>
          <a
            href="/"
            className="px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] transition-colors"
          >
            Naar Home
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-white/10 text-[10px] font-mono">
            Foutcode: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
