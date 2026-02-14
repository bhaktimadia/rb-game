"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import Confetti from "@/components/Confetti";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon from "@/components/GameIcon";

export default function SurprisePage() {
  const router = useRouter();
  const { resetGame } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [revealed, setRevealed] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Play victory music
  useEffect(() => {
    playMusic("victory");
  }, [playMusic]);

  // Staggered reveal timing
  useEffect(() => {
    if (!revealed) {
      setTimeout(() => setShowHeadline(true), 300);
      setTimeout(() => setShowSubtext(true), 800);
      setTimeout(() => setShowButton(true), 1800);
    }
  }, [revealed]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10">
      <Confetti trigger={revealed} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        {!revealed ? (
          <>
            {/* Gift Box with Enhanced Animations */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-12"
            >
              <div className="inline-block relative">
                {/* Gold Particle Sparkles around gift */}
                <motion.div
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.3, 0.8],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                  className="absolute -top-8 -right-8 text-gold"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.3, 0.8],
                    rotate: [0, -180, -360]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
                  className="absolute -top-8 -left-8 text-gold"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.3, 0.8],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1.6 }}
                  className="absolute -bottom-8 -right-8 text-gold"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <motion.div
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.3, 0.8],
                    rotate: [0, -180, -360]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 2.4 }}
                  className="absolute -bottom-8 -left-8 text-gold"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>

                {/* Gift Box with Breathing Glow */}
                <motion.div
                  animate={{ 
                    scale: [1.0, 1.03, 1.0],
                    boxShadow: [
                      "0 0 20px rgba(220, 38, 38, 0.4)",
                      "0 0 40px rgba(220, 38, 38, 0.6)",
                      "0 0 20px rgba(220, 38, 38, 0.4)"
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-40 h-40 bg-gradient-to-br from-crimson to-crimson-dark rounded-2xl border-4 border-gold flex items-center justify-center"
                >
                  <GameIcon type="chest" variant="neutral" size="lg" />
                </motion.div>
                {/* Ribbon */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-gold" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-4 bg-gold" />
                {/* Bow */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <GameIcon type="sparkle" variant="neutral" size="md" animated />
                </div>
              </div>
            </motion.div>

            {/* Cinematic Headline with Staggered Reveal */}
            <AnimatePresence>
              {showHeadline && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-foreground mb-4"
                >
                  YOUR VALENTINE SURPRISE
                </motion.h1>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSubtext && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-muted mb-10 leading-relaxed"
                >
                  <p className="text-base">
                    You balanced the storm.
                    <br />
                    You solved every memory.
                    <br />
                    <span className="text-foreground/80 font-medium">
                      Now… unwrap what was waiting all along.
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRevealed(true)}
                  className="px-10 py-4 bg-gold text-background font-bold text-lg rounded-xl glow-gold flex items-center justify-center gap-3 group"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <GameIcon type="treasure" variant="neutral" size="sm" showBadge={false} />
                  </motion.div>
                  UNWRAP SURPRISE
                </motion.button>
              )}
            </AnimatePresence>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex flex-col items-center"
            >
              {/* Heart animation with Glow */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                }}
                transition={{ duration: 0.5 }}
                className="mb-6 relative"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(236, 72, 153, 0.3)",
                      "0 0 30px rgba(236, 72, 153, 0.6)",
                      "0 0 15px rgba(236, 72, 153, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-full"
                >
                  <GameIcon type="love" variant="neutral" size="lg" animated />
                </motion.div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-2xl sm:text-3xl font-bold gradient-text-crimson mb-6 px-2"
                >
                  FINAL MISSION BRIEFING
                </motion.h1>

              {/* Mission Brief */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-card/50 border border-pink-glow/30 rounded-2xl p-6 mb-4 max-w-md"
              >
                <p className="text-foreground/90 leading-relaxed text-base">
                  Your final mission isn&apos;t on this screen.
                  <br />
                  It&apos;s in the real world.
                  <br /><br />
                  <span className="text-gold font-semibold">🎒 A surprise journey.</span>
                  <br />
                  <span className="text-muted text-sm">
                    No map.
                    <br />
                    No spoilers.
                    <br />
                    No escape.
                  </span>
                  <br /><br />
                  <span className="text-muted text-sm">
                    Date? <span className="text-crimson font-semibold">Classified.</span>
                    <br />
                    Location? <span className="text-crimson font-semibold">Confidential.</span>
                    <br />
                    Clues? <span className="text-crimson font-semibold">None.</span>
                  </span>
                  <br /><br />
                  <span className="text-pink-glow font-semibold text-lg">
                    Pack your trust, Silent Shinobi.
                    <br />
                    We&apos;re going on an adventure.
                  </span>
                </p>
              </motion.div>

              {/* Playful Bonus Quest */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="mb-8 text-center"
              >
                <div className="inline-block bg-gradient-to-r from-pink-500/10 via-gold/10 to-pink-500/10 border border-gold/20 rounded-lg px-5 py-3">
                  <p className="text-xs text-gold/90 font-semibold mb-1">
                    Bonus Side Quest:
                  </p>
                  <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-gold italic">
                    Salon Date + Fresh Hair Arc
                  </p>
                  <p className="text-[10px] text-muted italic mt-1">
                    Unlock permanent happiness buff.
                  </p>
                </div>
              </motion.div>

              {/* Hearts floating */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex justify-center gap-4 mb-8"
              >
                {(["heart1", "heart2", "heart3", "heart4", "heart5"] as const).map((heartType, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1,
                      y: [0, -10, 10, 0]
                    }}
                    transition={{ 
                      opacity: { delay: 0.9 + i * 0.1 },
                      y: { duration: 2, repeat: Infinity, delay: i * 0.2 }
                    }}
                  >
                    <GameIcon type={heartType} variant="memory" size="sm" showBadge={false} />
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-muted text-sm mb-6 italic"
              >
                But wait… there's one more thing.
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/final-reward")}
                className="px-10 py-4 bg-gold text-background font-bold text-lg rounded-xl glow-gold hover:scale-105 transition-all mb-4"
              >
                Continue ✈️
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9 }}
                onClick={() => {
                  resetGame();
                  window.location.href = "/";
                }}
                className="px-8 py-3 bg-card border border-muted/30 text-foreground font-medium rounded-xl hover:border-gold hover:scale-105 transition-all"
              >
                Play Again
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </main>
  );
}
