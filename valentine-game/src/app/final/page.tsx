"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import Confetti from "@/components/Confetti";
import Polaroid from "@/components/Polaroid";

export default function FinalPage() {
  const { xp } = useGameStore();
  const [showSurprise, setShowSurprise] = useState(false);
  const [photoClicks, setPhotoClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Add final XP on mount
  useEffect(() => {
    // XP should already be added from LevelComplete
  }, []);

  const handlePhotoClick = () => {
    const newClicks = photoClicks + 1;
    setPhotoClicks(newClicks);
    if (newClicks >= 5) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
      <Confetti trigger={true} />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/15 via-highlight/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showSurprise ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-lg w-full text-center"
          >
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="mb-6"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-accent/20 to-highlight/20 rounded-full">
                <span className="text-7xl">💘</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-foreground mb-2"
            >
              MISSION COMPLETE
            </motion.h1>

            {/* XP Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="inline-block bg-card border border-accent/30 rounded-xl px-8 py-4">
                <p className="text-xs text-muted mb-1">Total Love XP</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-crimson to-gold">
                  {xp}
                </p>
              </div>
            </motion.div>

            {/* Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card/50 backdrop-blur-sm border border-muted/10 rounded-2xl p-6 mb-8 text-left"
            >
              <p className="text-foreground/90 leading-relaxed mb-4">
                2 Years.
                <br />
                So many phases.
                <br />
                So much growth.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                You&apos;re not perfect.
                <br />
                I&apos;m not perfect.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                But we&apos;re real.
                <br />
                And we&apos;re solid.
              </p>
              <p className="text-highlight font-medium">
                And honestly?
                <br />
                I wouldn&apos;t trade this partnership for anything.
              </p>
            </motion.div>

            {/* Polaroid with Easter Egg */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center mb-8 cursor-pointer"
              onClick={handlePhotoClick}
            >
              <Polaroid caption="Still choosing each other" rotation={3} />
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => setShowSurprise(true)}
                className="group relative px-10 py-4 bg-accent text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,77,109,0.5)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent via-highlight to-accent bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  <span>UNLOCK YOUR REAL VALENTINE SURPRISE</span>
                </span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="surprise"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            <Confetti trigger={true} />

            {/* Sparkle */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <span className="text-8xl">✨</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-8"
            >
              SURPRISE UNLOCKED
            </motion.h2>

            {/* Surprise Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border-2 border-accent/40 rounded-2xl p-8 mb-8 shadow-[0_0_40px_rgba(255,77,109,0.2)]"
            >
              <p className="text-lg text-foreground leading-relaxed mb-4">
                Your real Valentine reward is waiting in the
              </p>
              <p className="text-3xl font-bold text-accent">
                ________
              </p>
              <p className="text-xs text-muted mt-4">
                (Location will be revealed soon)
              </p>
            </motion.div>

            {/* Hearts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-3 mb-8"
            >
              {["💕", "💖", "💗", "💝", "💘"].map((heart, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="text-3xl"
                >
                  {heart}
                </motion.span>
              ))}
            </motion.div>

            {/* Final Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <p className="text-muted mb-2">Thank you for playing.</p>
              <p className="text-highlight font-semibold text-lg">
                Happy Valentine&apos;s Day, Rahil.
              </p>
              <p className="text-muted/60 text-sm mt-4">
                Still your favorite player 2. 💕
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter Egg Popup */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-highlight text-white px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            Yes, I still like you. 💕
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
