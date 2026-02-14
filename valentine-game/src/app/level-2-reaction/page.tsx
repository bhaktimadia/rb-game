"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";

interface FloatingWord {
  id: number;
  text: string;
  isCorrect: boolean;
  x: number;
  y: number;
  tapped: boolean;
}

const words = [
  { text: "Overthinker", isCorrect: true },
  { text: "Drama Queen", isCorrect: true },
  { text: "Always Right", isCorrect: true },
  { text: "Loyal", isCorrect: true },
  { text: "Soft Heart", isCorrect: true },
  { text: "Caring", isCorrect: true },
  { text: "Calm", isCorrect: false },
  { text: "Never Hungry", isCorrect: false },
  { text: "Low Maintenance", isCorrect: false },
  { text: "Morning Person", isCorrect: false },
  { text: "Patient", isCorrect: false },
  { text: "Simple", isCorrect: false },
];

const GAME_DURATION = 20;

export default function Level2Reaction() {
  const { xp } = useGameStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wordIdCounter, setWordIdCounter] = useState(0);

  const spawnWord = useCallback(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    const newWord: FloatingWord = {
      id: wordIdCounter,
      text: word.text,
      isCorrect: word.isCorrect,
      x: Math.random() * 70 + 10, // 10-80%
      y: Math.random() * 60 + 15, // 15-75%
      tapped: false,
    };
    setWordIdCounter((prev) => prev + 1);
    setFloatingWords((prev) => [...prev.slice(-8), newWord]); // Keep max 9 words
  }, [wordIdCounter]);

  const handleWordTap = (wordId: number) => {
    setFloatingWords((prev) =>
      prev.map((w) => {
        if (w.id === wordId && !w.tapped) {
          if (w.isCorrect) {
            setCorrectTaps((c) => c + 1);
          } else {
            setWrongTaps((c) => c + 1);
          }
          return { ...w, tapped: true };
        }
        return w;
      })
    );
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

  // Spawn words
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const spawnInterval = setInterval(() => {
      spawnWord();
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, timeLeft, spawnWord]);

  // Remove old words
  useEffect(() => {
    if (!gameStarted) return;

    const cleanupInterval = setInterval(() => {
      setFloatingWords((prev) =>
        prev.filter((w) => !w.tapped || Date.now() - w.id < 500)
      );
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, [gameStarted]);

  const handleStart = () => {
    setGameStarted(true);
    spawnWord();
  };

  const totalCorrectWords = words.filter((w) => w.isCorrect).length;
  const accuracy = correctTaps + wrongTaps > 0
    ? Math.round((correctTaps / (correctTaps + wrongTaps)) * 100)
    : 0;

  if (!gameStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-muted/10 rounded-2xl p-8">
            <span className="text-xs font-bold tracking-widest text-accent">
              LEVEL 2
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">
              RAPID FIRE
            </h1>
            <p className="text-muted mb-6">
              Words will float across the screen.
              <br />
              <span className="text-highlight font-semibold">
                Tap only the words that describe your wife!
              </span>
            </p>

            <div className="bg-background/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted mb-2">You have</p>
              <p className="text-4xl font-bold text-accent">{GAME_DURATION}s</p>
            </div>

            <button
              onClick={handleStart}
              className="group relative px-10 py-4 bg-accent text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,77,109,0.4)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">START</span>
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-4 relative z-10 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto mb-4 px-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold tracking-widest text-crimson">
            LEVEL 2 – WIFE MODE
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gold text-sm font-bold">XP: {xp}</span>
            <span className="text-success text-sm font-bold">✓ {correctTaps}</span>
            <span className="text-error text-sm font-bold">✗ {wrongTaps}</span>
          </div>
        </div>
      </motion.div>

      {/* Timer */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-20"
      >
        <div
          className={`text-5xl font-bold ${
            timeLeft <= 5 ? "text-error animate-pulse" : "text-accent"
          }`}
        >
          {timeLeft}
        </div>
      </motion.div>

      {/* Floating Words Area */}
      <div className="flex-1 relative mt-16">
        <AnimatePresence>
          {floatingWords.map((word) => (
            <motion.button
              key={word.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: word.tapped ? 0 : 1,
                scale: word.tapped ? 1.5 : 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleWordTap(word.id)}
              disabled={word.tapped}
              className={`
                absolute px-4 py-2 rounded-full font-semibold text-sm
                transition-all duration-200 cursor-pointer
                ${
                  word.tapped
                    ? word.isCorrect
                      ? "bg-success text-white"
                      : "bg-error text-white"
                    : "bg-card border border-muted/30 text-foreground hover:border-accent hover:bg-accent/10"
                }
              `}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {word.text}
              {word.tapped && (
                <span className="ml-1">{word.isCorrect ? "✓" : "✗"}</span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-muted text-xs mt-4"
      >
        Tap words that describe her • Avoid wrong ones
      </motion.p>

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelComplete
          level={2}
          xpEarned={20}
          message={`You survived Wife Mode. ${accuracy}% accuracy.`}
          nextRoute="/level-3-timeline"
          nextLabel="NEXT LEVEL"
        />
      )}
    </main>
  );
}
