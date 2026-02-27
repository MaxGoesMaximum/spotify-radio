export default function RadioLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-radio-bg">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-radio-accent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-radio-accent/10 animate-pulse" />
        </div>
        <p className="text-white/20 text-xs tracking-widest uppercase">Radio laden...</p>
      </div>
    </div>
  );
}
