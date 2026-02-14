"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import Confetti from "@/components/Confetti";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon, { IconType } from "@/components/GameIcon";

interface Fragment {
  id: number;
  x: number;
  y: number;
  dropped: boolean;
}

export default function TreasurePage() {
  const router = useRouter();
  const { xp } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [draggedFragment, setDraggedFragment] = useState<number | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [chestOpen, setChestOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"reward" | "bonus" | null>(null);

  // Play victory music on treasure page
  useEffect(() => {
    playMusic("victory");
  }, [playMusic]);

  // Fragment icons - each represents a memory from the game
  const fragmentIcons: IconType[] = ["arcade", "popcorn", "coke", "hug", "anime", "drama", "love"];
  const fragmentLabels = ["Arcade", "Popcorn", "Money", "Hug", "Anime", "Natak", "Forever"];

  // Initialize fragment positions - perfect semicircle above chest
  useEffect(() => {
    // Position fragments in a perfect semicircle
    // Center at (160, 280), Radius: 150px, 7 fragments evenly spaced
    const centerX = 160;
    const centerY = 280;
    const radius = 150;
    const angleStep = Math.PI / 6; // 30 degrees in radians
    
    const fragmentPositions = Array.from({ length: 7 }, (_, i) => {
      const angle = i * angleStep; // 0°, 30°, 60°, 90°, 120°, 150°, 180°
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY - radius * Math.sin(angle),
      };
    });

    const positions: Fragment[] = fragmentPositions.map((pos, i) => ({
      id: i,
      x: pos.x,
      y: pos.y,
      dropped: false,
    }));
    
    setFragments(positions);
  }, []);

  const [magneticPull, setMagneticPull] = useState(false);

  const handleDragStart = (id: number) => {
    setDraggedFragment(id);
  };

  const handleDrop = () => {
    if (draggedFragment === null) return;

    const fragment = fragments.find((f) => f.id === draggedFragment);
    if (fragment && !fragment.dropped) {
      setFragments((prev) =>
        prev.map((f) =>
          f.id === draggedFragment ? { ...f, dropped: true } : f
        )
      );
      setDroppedCount((prev) => prev + 1);
    }
    setDraggedFragment(null);
    setMagneticPull(false);
  };

  // Check if all fragments dropped
  useEffect(() => {
    if (droppedCount === 7) {
      setTimeout(() => setChestOpen(true), 800); // Longer delay to show shake + lock glow
      setTimeout(() => {
        setShowMessage(true);
        setCurrentScreen("reward");
      }, 2500); // Longer delay before transition
    }
  }, [droppedCount]);

  const remainingFragments = fragments.filter((f) => !f.dropped);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text-gold opacity-25 px-2">
          THE TREASURE AWAITS
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gold/70 text-sm mt-2 italic font-medium"
        >
          Every fragment tells a story.
        </motion.p>
      </motion.div>

      {/* Game Area - Increased height for better spacing */}
      <div className="relative w-[280px] sm:w-[320px] h-[450px] sm:h-[500px] mt-4 mb-8">
        {/* Fragments around the chest */}
        <AnimatePresence>
          {remainingFragments.map((fragment) => (
            <motion.div
              key={fragment.id}
              layoutId={`fragment-${fragment.id}`}
              drag
              dragConstraints={{ left: -160, right: 160, top: -60, bottom: 400 }}
              onDragStart={() => handleDragStart(fragment.id)}
              onDrag={(e, info) => {
                // Check proximity for magnetic pull effect
                const chestArea = { x: 160, y: 360, radius: 100 };
                const distance = Math.sqrt(
                  Math.pow(fragment.x + info.offset.x - chestArea.x, 2) +
                  Math.pow(fragment.y + info.offset.y - chestArea.y, 2)
                );
                setMagneticPull(distance < chestArea.radius);
              }}
              onDragEnd={(e, info) => {
                // Check if dropped on chest area with magnetic snap
                const chestArea = { x: 160, y: 360, radius: 100 };
                const distance = Math.sqrt(
                  Math.pow(fragment.x + info.offset.x - chestArea.x, 2) +
                  Math.pow(fragment.y + info.offset.y - chestArea.y, 2)
                );
                if (distance < chestArea.radius) {
                  handleDrop();
                }
                setDraggedFragment(null);
                setMagneticPull(false);
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: fragment.x - 30,
                y: [fragment.y - 30, fragment.y - 35, fragment.y - 30]
              }}
              exit={{ 
                opacity: 0, 
                scale: [1, 1.5, 0], 
                y: 200,
                rotate: [0, 180, 360],
                filter: ["brightness(1)", "brightness(2)", "brightness(0)"]
              }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              whileHover={{ scale: 1.05 }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute w-16 h-16 cursor-grab active:cursor-grabbing group"
            >
              {/* Sparkle particles around fragment */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.8, 1, 0.8],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: fragment.id * 0.2
                }}
                className="absolute -top-2 -right-2 pointer-events-none"
                style={{ scale: 0.6 }}
              >
                <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
              </motion.div>

              {/* Memory Crystal/Gem Design */}
              <div className="w-full h-full relative">
                {/* Outer glow - enhanced on hover and pulsing */}
                <motion.div 
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gold/30 rounded-xl blur-md transition-all duration-300 group-hover:bg-gold/50 group-hover:blur-lg"
                />
                {/* Crystal body */}
                <div className="relative w-full h-full bg-gradient-to-br from-amber-900/80 via-amber-700/60 to-amber-800/80 rounded-xl border-2 border-gold/50 flex flex-col items-center justify-center shadow-lg overflow-hidden transition-all duration-300 group-hover:border-gold group-hover:shadow-xl group-hover:shadow-gold/30">
                  {/* Inner shine */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                  {/* Icon */}
                  <GameIcon 
                    type={fragmentIcons[fragment.id]} 
                    variant="neutral" 
                    size="sm" 
                    showBadge={false}
                  />
                  {/* Label */}
                  <span className="text-[8px] text-gold/90 font-bold mt-0.5 z-10">{fragmentLabels[fragment.id]}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Treasure Chest - Enlarged and Enhanced */}
        <motion.div
          className="absolute left-1/2 bottom-8 -translate-x-1/2"
          animate={
            chestOpen 
              ? { scale: [1, 1.15, 1] } 
              : droppedCount === 7 
              ? { 
                  rotate: [-8, 8, -8, 8, -5, 5, 0], 
                  scale: [1, 1.08, 1.05, 1.08, 1.05, 1.02, 1],
                  y: [0, -5, 0, -3, 0, -2, 0]
                }
              : { y: [0, -8, 0], scale: [1, 1.02, 1] }
          }
          transition={
            chestOpen 
              ? { duration: 0.8 }
              : droppedCount === 7
              ? { duration: 0.8, times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* Chest glow effect - pulsing with magnetic feedback */}
          <motion.div 
            animate={{
              opacity: chestOpen ? [0.6, 1, 0.6] : magneticPull ? 0.7 : [0.3, 0.5, 0.3],
              scale: chestOpen ? [1, 1.2, 1] : magneticPull ? 1.3 : [1, 1.1, 1]
            }}
            transition={{ duration: magneticPull ? 0.3 : 2, repeat: magneticPull ? 0 : Infinity }}
            className={`
              absolute inset-0 -m-12 rounded-full blur-3xl
              ${chestOpen ? "bg-gold/70" : magneticPull ? "bg-gold/80" : "bg-gold/40"}
            `} 
          />

          {/* Gold burst on completion */}
          {droppedCount === 7 && !chestOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 -m-20 rounded-full bg-gold/60 blur-2xl"
            />
          )}

          {/* Main Chest Container - Enlarged */}
          <motion.div
            className="relative"
            style={{ perspective: "600px", scale: 1.3 }}
          >
            {/* Chest Lid */}
            <motion.div
              animate={{ rotateX: chestOpen ? -120 : 0 }}
              style={{ transformOrigin: "bottom", transformStyle: "preserve-3d" }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative z-10"
            >
              {/* Lid top curved part */}
              <div className="w-28 h-10 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-t-[50%] border-4 border-amber-500 relative">
                {/* Wood grain lines */}
                <div className="absolute top-2 left-4 right-4 h-0.5 bg-amber-900/30 rounded" />
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-amber-900/30 rounded" />
                {/* Metal band on lid */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-500 to-amber-600 border-t-2 border-amber-400" />
              </div>
            </motion.div>

            {/* Chest Body */}
            <div className="w-28 h-16 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-b-lg border-4 border-t-0 border-amber-600 relative -mt-1 overflow-hidden">
              {/* Wood grain texture */}
              <div className="absolute top-2 left-3 right-3 h-0.5 bg-amber-950/30 rounded" />
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-amber-950/30 rounded" />
              <div className="absolute top-8 left-3 right-3 h-0.5 bg-amber-950/30 rounded" />
              
              {/* Metal corners */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-amber-500 rounded-br-lg border-r-2 border-b-2 border-amber-400" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-amber-500 rounded-bl-lg border-l-2 border-b-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-amber-500 rounded-tr-lg border-r-2 border-t-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 rounded-tl-lg border-l-2 border-t-2 border-amber-400" />
              
              {/* Lock plate with glow on completion */}
              <motion.div 
                animate={
                  droppedCount === 7 && !chestOpen
                    ? { 
                        boxShadow: [
                          "0 0 10px rgba(251, 191, 36, 0.5)",
                          "0 0 30px rgba(251, 191, 36, 0.8)",
                          "0 0 10px rgba(251, 191, 36, 0.5)"
                        ]
                      }
                    : {}
                }
                transition={{ duration: 0.6, repeat: droppedCount === 7 && !chestOpen ? Infinity : 0 }}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-b-lg border-2 border-amber-300 flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-amber-900 rounded-full border border-amber-700">
                  <div className="w-1 h-2 bg-amber-900 mx-auto mt-2 rounded-b" />
                </div>
              </motion.div>

              {/* Inner glow when open */}
              {chestOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-gold via-amber-400/80 to-transparent"
                />
              )}
            </div>

            {/* Sparkles around chest */}
            {droppedCount > 0 && !chestOpen && (
              <>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-4 -left-4"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-4 -right-4"
                >
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Energy beam */}
          {chestOpen && (
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 1, 0.6] }}
              transition={{ duration: 1.5 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-48 bg-gradient-to-t from-gold via-amber-300/60 to-transparent blur-md"
              style={{ transformOrigin: "bottom" }}
            />
          )}

          {/* Drop count indicator */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.span
              key={droppedCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="text-gold text-sm font-medium"
            >
              Memories Collected: {droppedCount} / 7
            </motion.span>
          </div>
        </motion.div>

        {/* Instructions */}
        {!chestOpen && droppedCount < 7 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-0 left-0 right-0 text-center text-xs text-gold/60 italic"
          >
            Drag the memories into the chest
          </motion.p>
        )}
      </div>

      {/* Screen Flash Effect on Completion */}
      <AnimatePresence>
        {droppedCount === 7 && !chestOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-gold pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* Confetti and Final Message */}
      <AnimatePresence>
        {showMessage && (
          <>
            <Confetti trigger={true} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4"
            >
              <div className="max-w-lg w-full text-center">
                {/* Badge with Sparkle Particles */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                  className="inline-block mb-6"
                >
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold">
                      <GameIcon type="treasure" variant="neutral" size="lg" animated />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-dashed border-gold/30"
                    />
                    
                    {/* Floating Sparkle Particles */}
                    <motion.div
                      animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                        y: [-5, -15, -5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className="absolute -top-6 -right-6"
                    >
                      <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                        y: [-5, -15, -5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                      className="absolute -top-6 -left-6"
                    >
                      <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                        y: [-5, -15, -5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                      className="absolute -bottom-2 -right-8"
                    >
                      <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                        y: [-5, -15, -5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 2.1 }}
                      className="absolute -bottom-2 -left-8"
                    >
                      <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Screen 1: Emotional Reward */}
                {currentScreen === "reward" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-black mb-6"
                    >
                      <span className="gradient-text-gold">FOREVER CO-OP PARTNER</span>
                    </motion.h2>

                    {/* XP with Overflow Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mb-8"
                    >
                      {(xp + 100) > 1000 ? (
                        <div className="space-y-2">
                          <motion.p
                            animate={{ 
                              textShadow: [
                                "0 0 10px rgba(212, 175, 55, 0.5)",
                                "0 0 20px rgba(212, 175, 55, 0.8)",
                                "0 0 10px rgba(212, 175, 55, 0.5)"
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-gold text-xl font-bold flex items-center justify-center gap-2"
                          >
                            <span>Total XP: {xp + 100}</span>
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ✨
                            </motion.span>
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-gold/90 text-sm font-semibold"
                          >
                            BONUS XP UNLOCKED ✨
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-gold/70 text-xs italic"
                          >
                            Love doesn&apos;t cap at 1000.
                          </motion.p>
                        </div>
                      ) : (
                        <p className="text-gold text-xl font-bold">
                          Total XP: {xp + 100}/1000
                        </p>
                      )}
                    </motion.div>

                    {/* Emotional Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-card/50 border border-gold/30 rounded-2xl p-8 mb-8"
                    >
                      <p className="text-foreground/90 leading-relaxed text-base">
                        You are my calm in chaos.
                        <br />
                        My silent strength in every storm.
                        <br /><br />
                        Through anime distractions, natak hurricanes,
                        <br />
                        bathtub hunts, and every hug before office —
                        <br /><br />
                        <span className="text-pink-glow font-semibold text-lg">
                          I choose this mission. With you. Always.
                        </span>
                      </p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentScreen("bonus")}
                      className="px-10 py-4 bg-gold text-background font-bold text-lg rounded-xl glow-gold hover:scale-105 transition-all"
                    >
                      Continue to Bonus Quest ✨
                    </motion.button>
                  </motion.div>
                )}

                {/* Screen 2: Bonus Quest */}
                {currentScreen === "bonus" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Sparkle animation */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                      className="mb-6"
                    >
                      <motion.span
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl inline-block"
                      >
                        ✨
                      </motion.span>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-black mb-8"
                    >
                      <motion.span
                        animate={{
                          textShadow: [
                            "0 0 20px rgba(251, 191, 36, 0.4)",
                            "0 0 30px rgba(251, 191, 36, 0.6)",
                            "0 0 20px rgba(251, 191, 36, 0.4)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="gradient-text-gold"
                      >
                        BONUS REAL-LIFE QUEST UNLOCKED
                      </motion.span>
                    </motion.h2>

                    {/* Quest Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-rose-950/50 via-amber-950/40 to-rose-950/50 border-2 border-gold/40 rounded-2xl p-8 mb-8"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-2xl font-bold text-gold mb-6"
                      >
                        Side Quest Activated 💇‍♀️
                      </motion.p>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-gold/90 leading-relaxed space-y-2 mb-6"
                      >
                        <p>Take her on that salon date.</p>
                        <p>The haircut she&apos;s been hinting at.</p>
                        <p className="text-amber-300/90">Add the surprise color upgrade.</p>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-gold pt-4 border-t border-gold/20"
                      >
                        Legendary Husband Mode: ON
                      </motion.p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/final-reward")}
                      className="px-10 py-4 bg-gold text-background font-bold text-lg rounded-xl glow-gold hover:scale-105 transition-all"
                    >
                      Continue to Final Reward ✈️
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
