"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import Confetti from "./Confetti";

interface LevelCompleteProps {
  level: number;
  xpEarned: number;
  clue?: string;
  message?: string;
  nextRoute: string;
  nextLabel?: string;
}

export default function LevelComplete({
  level,
  xpEarned,
  clue,
  message,
  nextRoute,
  nextLabel = "CONTINUE",
}: LevelCompleteProps) {
  const router = useRouter();
  const { addXP, addScrollFragment, addClue, completeLevel } = useGameStore();
  
  const displayText = message || clue || "";

  const handleContinue = () => {
    addXP(xpEarned);
    addScrollFragment();
    if (clue) addClue(clue);
    completeLevel(level);
    router.push(nextRoute);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Confetti trigger={true} />

      <div className="max-w-md w-full text-center">
        {/* Scroll Fragment Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-gold/20 to-gold-dark/20 border-2 border-gold flex items-center justify-center glow-gold scroll-float">
              <span className="text-5xl">📜</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-crimson rounded-full flex items-center justify-center text-white text-sm font-bold glow-crimson"
            >
              {level}
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          SCROLL FRAGMENT {level} UNLOCKED
        </motion.h2>

        {/* XP Earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <span className="text-3xl font-bold gradient-text-gold">+{xpEarned} XP</span>
        </motion.div>

        {/* Clue/Message */}
        {displayText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 border border-crimson/30 rounded-xl p-4 mb-8"
          >
            <p className="text-xs text-crimson font-bold tracking-wider mb-2">
              🔮 MEMORY CLUE
            </p>
            <p className="text-foreground/90 italic">&ldquo;{displayText}&rdquo;</p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleContinue}
          data-level-complete-continue
          className="group relative px-10 py-4 bg-crimson text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 glow-crimson"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-crimson via-pink-glow to-crimson bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10">{nextLabel}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
