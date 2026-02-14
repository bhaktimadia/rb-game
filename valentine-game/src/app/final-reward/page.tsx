"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon from "@/components/GameIcon";

export default function FinalRewardPage() {
  const { xp, resetGame } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [showContent, setShowContent] = useState(false);

  // Play victory music
  useEffect(() => {
    playMusic("victory");
    setTimeout(() => setShowContent(true), 500);
  }, [playMusic]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 overflow-hidden">
      {/* Dark gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90 z-0" />
      
      {/* Animated gold particles in background */}
      <div className="absolute inset-0 z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            className="w-2 h-2 rounded-full bg-gold/40 blur-sm"
          />
        ))}
      </div>

      {/* XP Bar - Faded at top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="fixed top-4 right-4 z-20"
      >
        <div className="bg-card/30 border border-gold/20 rounded-xl px-4 py-2">
          <p className="text-xs text-gold/60 mb-1">Total XP</p>
          <p className="text-sm font-bold text-gold/80">{xp}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
            className="relative z-10 max-w-2xl w-full text-center"
          >
            {/* Plane Icon with Animation */}
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
              }}
              transition={{ 
                duration: 1.5,
                type: "spring",
                stiffness: 50
              }}
              className="mb-8 relative"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block text-8xl"
              >
                ✈️
              </motion.div>
              
              {/* Sparkles around plane */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                className="absolute -top-4 -right-8"
              >
                <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
              </motion.div>
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, -180, -360]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -top-4 -left-8"
              >
                <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
              </motion.div>
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-2 right-0"
              >
                <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
              </motion.div>
            </motion.div>

            {/* Main Heading with Gold Glow */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-10 px-2"
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 20px rgba(251, 191, 36, 0.4)",
                    "0 0 40px rgba(251, 191, 36, 0.7)",
                    "0 0 20px rgba(251, 191, 36, 0.4)"
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="gradient-text-gold"
              >
                FINAL REWARD UNLOCKED
              </motion.span>
            </motion.h1>

            {/* Body Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="space-y-6 text-foreground/90 text-base sm:text-lg leading-relaxed px-4"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-2xl font-semibold text-gold"
              >
                This year…
                <br />
                We're going somewhere new.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="space-y-4 text-base"
              >
                <p>
                  <span className="text-gold/80 font-semibold">When?</span>
                  <br />
                  <span className="text-muted italic">Secret.</span>
                </p>

                <p>
                  <span className="text-gold/80 font-semibold">Where?</span>
                  <br />
                  <span className="text-muted italic">Even more secret.</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="pt-6"
              >
                <p className="text-xl text-foreground/80 mb-2">
                  But one thing is confirmed —
                </p>
                <motion.p
                  animate={{
                    textShadow: [
                      "0 0 15px rgba(251, 191, 36, 0.3)",
                      "0 0 25px rgba(251, 191, 36, 0.6)",
                      "0 0 15px rgba(251, 191, 36, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-3xl font-black gradient-text-gold"
                >
                  You and me.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-lg font-semibold text-gold/90 mt-3"
                >
                  Adventure mode activated.
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Play Again Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetGame();
                window.location.href = "/";
              }}
              className="mt-12 px-10 py-4 bg-card border-2 border-gold/40 text-foreground font-semibold rounded-xl hover:bg-gold/10 hover:border-gold transition-all"
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
