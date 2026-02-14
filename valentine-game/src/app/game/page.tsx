"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon from "@/components/GameIcon";

export default function GameLanding() {
  const router = useRouter();
  const { resetGame } = useGameStore();
  const { fadeToTrack } = useBackgroundMusic();
  const [isSliced, setIsSliced] = useState(false);
  const [slicePath, setSlicePath] = useState<{ x: number; y: number }[]>([]);
  const [isSlicing, setIsSlicing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Fade from romantic to game music
  useEffect(() => {
    fadeToTrack("game");
  }, [fadeToTrack]);

  // Intro typing animation
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSliced) return;
    setIsSlicing(true);
    setSlicePath([{ x: e.clientX, y: e.clientY }]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSlicing || isSliced) return;
    
    const newPath = [...slicePath, { x: e.clientX, y: e.clientY }];
    setSlicePath(newPath);

    // Check if slice crosses the scroll
    if (scrollRef.current && newPath.length > 5) {
      const rect = scrollRef.current.getBoundingClientRect();
      const scrollCenterY = rect.top + rect.height / 2;
      
      // Check if path crosses scroll horizontally
      const crossesScroll = newPath.some((point, i) => {
        if (i === 0) return false;
        const prev = newPath[i - 1];
        const crossesY = (prev.y < scrollCenterY && point.y > scrollCenterY) ||
                        (prev.y > scrollCenterY && point.y < scrollCenterY);
        const inXRange = point.x > rect.left && point.x < rect.right;
        return crossesY && inXRange;
      });

      if (crossesScroll) {
        setIsSliced(true);
        resetGame();
        setTimeout(() => router.push("/level-1"), 1500);
      }
    }
  };

  const handlePointerUp = () => {
    setIsSlicing(false);
    if (!isSliced) {
      setSlicePath([]);
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 relative z-10 select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Slice Trail */}
      {slicePath.length > 1 && (
        <svg className="fixed inset-0 pointer-events-none z-50">
          <motion.path
            d={`M ${slicePath.map(p => `${p.x} ${p.y}`).join(" L ")}`}
            stroke="url(#sliceGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
          <defs>
            <linearGradient id="sliceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC143C" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#DC143C" />
            </linearGradient>
          </defs>
        </svg>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-2xl w-full text-center relative"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-2">
            <span className="gradient-text-crimson text-glow-crimson">LOVE</span>
            <span className="text-foreground"> NO </span>
            <span className="gradient-text-gold text-glow-gold">JUTSU</span>
          </h1>
          <p className="text-muted text-sm tracking-[0.3em] uppercase">
            Silent Shinobi × Drama Storm
          </p>
        </motion.div>

        {/* Intro Text */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-8 text-muted"
            >
              <p>A calm shinobi once lived peacefully...</p>
              <p>Until a Drama Storm changed everything.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliceable Scroll */}
        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative mb-8"
        >
          <AnimatePresence>
            {!isSliced ? (
              <motion.div
                key="scroll"
                className="relative inline-block"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Scroll */}
                <div className="bg-gradient-to-b from-gold/30 to-gold-dark/30 border-2 border-gold rounded-lg px-12 py-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/scroll-texture.png')] opacity-10" />
                  <div className="flex items-center justify-center gap-2 text-gold font-bold text-xl mb-2">
                    <GameIcon type="scroll" variant="neutral" size="sm" showBadge={false} />
                    MISSION SCROLL
                  </div>
                  <p className="text-gold/70 text-sm">Slice to begin</p>
                  
                  {/* Slice guide line */}
                  <motion.div
                    className="absolute left-0 right-0 top-1/2 h-0.5 bg-crimson/50"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gold/20 blur-xl -z-10" />
              </motion.div>
            ) : (
              <>
                {/* Sliced top half */}
                <motion.div
                  key="top"
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: -100, rotate: -15, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-b from-gold/30 to-gold-dark/30 border-2 border-gold rounded-t-lg px-12 py-4"
                >
                  <div className="flex items-center gap-2 text-gold font-bold">
                    <GameIcon type="scroll" variant="neutral" size="sm" showBadge={false} />
                    MISSION
                  </div>
                </motion.div>

                {/* Sliced bottom half */}
                <motion.div
                  key="bottom"
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: 100, rotate: 15, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-b from-gold-dark/30 to-gold/30 border-2 border-gold rounded-b-lg px-12 py-4"
                >
                  <div className="flex items-center gap-2 text-gold/70 text-sm">
                    SCROLL
                    <GameIcon type="scroll" variant="neutral" size="sm" showBadge={false} />
                  </div>
                </motion.div>

                {/* Slice effect */}
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gold rounded-full"
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Instructions */}
        {!isSliced && !showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted text-sm flex items-center gap-2"
          >
            <GameIcon type="shuriken" variant="neutral" size="sm" showBadge={false} />
            Swipe across the scroll to begin your mission
          </motion.div>
        )}

        {/* Loading after slice */}
        {isSliced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold font-bold"
          >
            <p>MISSION ACTIVATED...</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
