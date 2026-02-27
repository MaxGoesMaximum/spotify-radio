import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Ambient subtle glow */}
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] rounded-full bg-white/[0.015] blur-[120px]" />

      <div className="text-center max-w-md relative z-10">
        <div className="text-[120px] font-bold text-white/[0.04] font-heading leading-none select-none mb-2">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight -mt-8">
          Pagina niet gevonden
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
          >
            Naar Home
          </Link>
          <Link
            href="/radio"
            className="px-6 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] transition-colors"
          >
            Naar Radio
          </Link>
        </div>
      </div>
    </div>
  );
}
