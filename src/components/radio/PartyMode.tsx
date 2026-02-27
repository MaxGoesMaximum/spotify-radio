"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRadioStore } from "@/store/radio-store";
import { useToast } from "@/components/ui/Toast";

export function PartyModeToggle() {
  const partyMode = useRadioStore((s) => s.partyMode);
  const togglePartyMode = useRadioStore((s) => s.togglePartyMode);
  const { toast } = useToast();

  const handleToggle = () => {
    togglePartyMode();
    if (!partyMode) {
      toast("Party Mode aan! \ud83c\udf89", "success");
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all overflow-hidden ${partyMode
          ? "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border-purple-400/30 text-purple-300"
          : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        }`}
    >
      {/* Animated gradient border when active */}
      {partyMode && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            background: "linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #ff006e)",
            backgroundSize: "300% 300%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      <span className="relative z-10 text-sm">
        {partyMode ? "\ud83c\udf89" : "\ud83c\udf8a"}
      </span>
      <span className="relative z-10 text-xs font-medium">Party</span>

      {/* Animated dots when active */}
      {partyMode && (
        <div className="relative z-10 flex gap-[2px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-purple-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}

/** Fullscreen party overlay effects — renders behind content */
export function PartyOverlay() {
  const partyMode = useRadioStore((s) => s.partyMode);
  const isPlaying = useRadioStore((s) => s.isPlaying);

  if (!partyMode || !isPlaying) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden mix-blend-screen">
      {/* Strobing color wash - More vibrant */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255,0,110,0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, rgba(131,56,236,0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, rgba(58,134,255,0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 80%, rgba(255,0,110,0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Dynamic Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          perspective: '1000px',
          transform: 'rotateX(60deg) scale(2.5) translateY(-20%)',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% { transform: rotateX(60deg) scale(2.5) translateY(-20%); }
          100% { transform: rotateX(60deg) scale(2.5) translateY(0%); }
        }
      `}</style>


      {/* Moving spotlight beams - Wider and brighter */}
      <motion.div
        className="absolute w-[400px] h-[800px] opacity-[0.08] mix-blend-plus-lighter"
        style={{
          background: "linear-gradient(to bottom, transparent, #ff006e, transparent)",
          filter: "blur(60px)",
          transformOrigin: "top left",
        }}
        animate={{
          left: ["-20%", "120%"],
          rotate: [-25, 25],
        }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[800px] opacity-[0.08] mix-blend-plus-lighter"
        style={{
          background: "linear-gradient(to bottom, transparent, #3a86ff, transparent)",
          filter: "blur(60px)",
          transformOrigin: "top right",
        }}
        animate={{
          right: ["-20%", "120%"],
          rotate: [25, -25],
        }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
      />

      {/* Beat-reactive pulse ring - Layered and rhythmic */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[300px] h-[300px] rounded-full border-2 border-purple-500/20 shadow-[0_0_60px_rgba(131,56,236,0.3)]"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 0.86, repeat: Infinity, ease: "easeOut" }} // Approx 140 BPM
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-pink-500/30 shadow-[0_0_80px_rgba(255,0,110,0.2)]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{ duration: 1.72, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full border border-blue-500/10"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 3.44, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating geometric particles */}
      {Array.from({ length: 24 }).map((_, i) => {
        const size = 6 + (i % 6) * 4; // 6px to 26px
        const colors = ["#ff006e", "#8338ec", "#3a86ff", "#ffbe0b", "#06d6a0"];
        const color = colors[i % colors.length];
        const isCircle = i % 2 === 0;

        return (
          <motion.div
            key={i}
            className="absolute shadow-[0_0_15px_currentColor]"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              color: color,
              backgroundColor: color,
              borderRadius: isCircle ? '50%' : '4px',
              rotate: isCircle ? 0 : 45,
            }}
            animate={{
              top: ["110%", "-10%"],
              opacity: [0, 0.8, 0.8, 0],
              x: [0, Math.sin(i) * 60, Math.cos(i) * -60, 0],
              rotate: isCircle ? 0 : [45, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
