"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon, { IconType } from "@/components/GameIcon";

interface FallingItem {
  id: number;
  iconType: IconType;
  name: string;
  isCorrect: boolean;
  x: number;
  y: number;
  speed: number;
}

const correctItems: { iconType: IconType; name: string }[] = [
  { iconType: "popcorn", name: "Popcorn" },
  { iconType: "anime", name: "Anime" },
  { iconType: "drama", name: "Natak" },
  { iconType: "speech", name: "Nothing" },
  { iconType: "hug", name: "Hug" },
];

const wrongItems: { iconType: IconType; name: string }[] = [
  { iconType: "mute", name: "Silence" },
  { iconType: "sleep", name: "Sleep" },
  { iconType: "phone", name: "Ignore" },
  { iconType: "cold", name: "Cold" },
];

const GAME_DURATION = 30;
const REQUIRED_CORRECT = 15;

export default function Level2() {
  const { addXP } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [gameStarted, setGameStarted] = useState(false);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [shake, setShake] = useState(false);
  const [showXP, setShowXP] = useState<{ x: number; y: number; correct: boolean } | null>(null);
  const itemIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Play game music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  const spawnItem = useCallback(() => {
    const allItems = [...correctItems, ...correctItems, ...wrongItems]; // More correct items
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    const isCorrect = correctItems.some(c => c.name === item.name);

    const newItem: FallingItem = {
      id: itemIdRef.current++,
      iconType: item.iconType,
      name: item.name,
      isCorrect,
      x: Math.random() * 80 + 10, // 10-90%
      y: -10,
      speed: Math.random() * 2 + 3, // 3-5 seconds to fall
    };

    setItems((prev) => [...prev.slice(-10), newItem]); // Keep max 11 items
  }, []);

  const handleItemTap = (item: FallingItem, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (item.isCorrect) {
      setScore((prev) => prev + 1);
      addXP(5);
      setShowXP({ x: rect.left, y: rect.top, correct: true });
    } else {
      setMisses((prev) => prev + 1);
      addXP(-10); // Deduct 10 XP for wrong tap
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setShowXP({ x: rect.left, y: rect.top, correct: false });
    }

    setTimeout(() => setShowXP(null), 500);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Game timer
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Spawn items
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const spawnInterval = setInterval(spawnItem, 800);
    return () => clearInterval(spawnInterval);
  }, [gameStarted, timeLeft, spawnItem]);

  // Animate items falling - SLOWER speed
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const moveInterval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({ ...item, y: item.y + 0.8 })) // Slower: was 2, now 0.8
          .filter((item) => item.y < 110) // Remove items that fell off
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameStarted, timeLeft]);

  if (!gameStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-crimson/20 rounded-2xl p-8">
            <span className="text-crimson text-sm font-bold tracking-widest">
              LEVEL 2
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">
              SILENT SHINOBI TEST
            </h1>
            <p className="text-muted mb-6">
              Objects will fall from above.
              <br />
              <span className="text-gold font-semibold">
                Tap the correct ones! Avoid the wrong ones!
              </span>
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* TAP Items Container */}
              <div 
                className="border border-emerald-500/25 rounded-xl p-5 pb-6"
                style={{
                  background: "linear-gradient(180deg, rgba(6,78,59,0.35) 0%, rgba(6,78,59,0.2) 100%)",
                }}
              >
                <p className="text-xs text-emerald-400 mb-5 font-semibold tracking-wider">TAP THESE ✓</p>
                <div className="flex justify-center gap-4">
                  {correctItems.slice(0, 3).map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        repeatType: "mirror",
                        delay: i * 0.4 
                      }}
                      whileHover={{ 
                        y: -3, 
                        rotate: 2,
                        scale: 1.06,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }
                      }}
                    >
                      {/* Badge container */}
                      <div 
                        className="relative w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(165deg, rgba(30,50,30,0.95) 0%, rgba(15,30,15,0.98) 40%, rgba(8,20,8,1) 100%)",
                          boxShadow: `
                            0 0 8px rgba(34,197,94,0.6),
                            0 0 18px rgba(34,197,94,0.35),
                            0 0 28px rgba(34,197,94,0.15),
                            inset 0 1px 2px rgba(255,255,255,0.08),
                            inset 0 -1px 3px rgba(0,0,0,0.4),
                            0 2px 4px rgba(0,0,0,0.3)
                          `,
                          border: "1.5px solid rgba(34,197,94,0.4)",
                        }}
                      >
                        {/* Inner highlight arc */}
                        <div 
                          className="absolute inset-[3px] rounded-full pointer-events-none"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
                          }}
                        />
                        <GameIcon type={item.iconType} variant="tap" size="sm" showBadge={false} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AVOID Items Container */}
              <div 
                className="border border-red-500/25 rounded-xl p-5 pb-6"
                style={{
                  background: "linear-gradient(180deg, rgba(127,29,29,0.35) 0%, rgba(127,29,29,0.2) 100%)",
                }}
              >
                <p className="text-xs text-red-400 mb-5 font-semibold tracking-wider">AVOID ✗</p>
                <div className="flex justify-center gap-4">
                  {wrongItems.slice(0, 3).map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        repeatType: "mirror",
                        delay: i * 0.4 
                      }}
                      whileHover={{ 
                        y: -3, 
                        rotate: -2,
                        scale: 1.06,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }
                      }}
                    >
                      {/* Badge container */}
                      <div 
                        className="relative w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(165deg, rgba(50,30,30,0.95) 0%, rgba(30,15,15,0.98) 40%, rgba(20,8,8,1) 100%)",
                          boxShadow: `
                            0 0 8px rgba(239,68,68,0.6),
                            0 0 18px rgba(239,68,68,0.35),
                            0 0 28px rgba(239,68,68,0.15),
                            inset 0 1px 2px rgba(255,255,255,0.08),
                            inset 0 -1px 3px rgba(0,0,0,0.4),
                            0 2px 4px rgba(0,0,0,0.3)
                          `,
                          border: "1.5px solid rgba(239,68,68,0.4)",
                        }}
                      >
                        {/* Inner highlight arc */}
                        <div 
                          className="absolute inset-[3px] rounded-full pointer-events-none"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
                          }}
                        />
                        <GameIcon type={item.iconType} variant="avoid" size="sm" showBadge={false} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-background/30 rounded-xl p-4 mb-6">
              <p className="text-4xl font-bold text-gold">{GAME_DURATION}s</p>
              <p className="text-sm text-muted">Time limit</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameStarted(true)}
              className="px-10 py-4 bg-gradient-to-r from-crimson to-red-600 text-white font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(220,20,60,0.4)]"
            >
              START GAME
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen flex flex-col p-2 sm:p-4 relative z-10 overflow-hidden ${shake ? "animate-shake" : ""}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-4 mt-8"
      >
        <div className="text-center">
          <p className="text-xs text-muted">SCORE</p>
          <p className="text-2xl font-bold text-gold">{score}</p>
        </div>
        <div className={`text-center ${timeLeft <= 10 ? "text-error" : ""}`}>
          <p className="text-xs text-muted">TIME</p>
          <p className={`text-3xl font-bold ${timeLeft <= 10 ? "animate-pulse" : ""}`}>
            {timeLeft}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted">MISSES</p>
          <p className="text-2xl font-bold text-error">{misses}</p>
        </div>
      </motion.div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative bg-gradient-to-b from-card/10 to-card/30 rounded-2xl border border-muted/20 overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(239,68,68,0.05) 0%, transparent 50%)",
        }}
      >
        {/* Subtle grid lines */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleItemTap(item, e);
              }}
              className={`
                absolute w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer
                transition-all active:scale-90 backdrop-blur-sm z-10
                ${item.isCorrect 
                  ? "bg-emerald-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/60" 
                  : "bg-red-950/40 border-2 border-red-500/40 hover:border-red-400 hover:bg-red-950/60"
                }
              `}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: item.isCorrect 
                  ? "0 0 20px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 0 20px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <GameIcon 
                type={item.iconType} 
                variant={item.isCorrect ? "tap" : "avoid"} 
                size="md"
                showBadge={false}
              />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* XP Popup */}
        <AnimatePresence>
          {showXP && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -50, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`fixed text-lg font-bold pointer-events-none z-50 ${showXP.correct ? "text-emerald-400" : "text-red-400"}`}
              style={{ 
                left: showXP.x, 
                top: showXP.y,
                textShadow: showXP.correct 
                  ? "0 0 10px rgba(34,197,94,0.8)" 
                  : "0 0 10px rgba(239,68,68,0.8)"
              }}
            >
              {showXP.correct ? "+5 XP ✓" : "-10 XP ✗"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap zone indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>Progress</span>
          <span className="text-gold font-semibold">{score}/{REQUIRED_CORRECT}</span>
        </div>
        <div className="w-full h-3 bg-card/50 rounded-full overflow-hidden border border-gold/20">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-gold to-emerald-500 rounded-full"
            animate={{ width: `${Math.min((score / REQUIRED_CORRECT) * 100, 100)}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px rgba(34,197,94,0.5)",
            }}
          />
        </div>
      </div>

      {/* Level Complete */}
      {isComplete && (
        <LevelComplete
          level={2}
          xpEarned={0}
          clue="Even silent hearts panic in storms."
          nextRoute="/level-3"
        />
      )}
    </main>
  );
}
