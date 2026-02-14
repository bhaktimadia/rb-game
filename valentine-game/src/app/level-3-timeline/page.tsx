"use client";

import { useState, useEffect } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";

interface Milestone {
  id: string;
  text: string;
  emoji: string;
  order: number;
  message: string;
}

const correctOrder: Milestone[] = [
  { id: "1", text: "First Talk", emoji: "💬", order: 1, message: "Where it all began" },
  { id: "2", text: "First Date", emoji: "☕", order: 2, message: "Butterflies everywhere" },
  { id: "3", text: "Engagement", emoji: "💍", order: 3, message: "She said yes!" },
  { id: "4", text: "Wedding", emoji: "💒", order: 4, message: "Version 1.0 launched" },
  { id: "5", text: "First Big Fight", emoji: "⚡", order: 5, message: "Growth moment" },
  { id: "6", text: "First Trip", emoji: "✈️", order: 6, message: "Adventure unlocked" },
];

export default function Level3Timeline() {
  const { xp } = useGameStore();
  const [items, setItems] = useState<Milestone[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Shuffle on mount
  useEffect(() => {
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  const checkOrder = () => {
    setIsChecking(true);
    setAttempts((prev) => prev + 1);

    const isOrderCorrect = items.every(
      (item, index) => item.order === index + 1
    );

    setIsCorrect(isOrderCorrect);
    setShowFeedback(true);

    if (isOrderCorrect) {
      setTimeout(() => {
        setIsComplete(true);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setIsChecking(false);
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-4 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto mb-6 px-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold tracking-widest text-crimson">
            LEVEL 3
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gold text-sm font-bold">XP: {xp}</span>
            <span className="text-xs text-muted">Attempts: {attempts}</span>
          </div>
        </div>
      </motion.div>

      {/* Level Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          BUILD OUR TIMELINE
        </h1>
        <p className="text-muted text-sm">
          Drag milestones into the correct order
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Timeline line */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-highlight to-accent opacity-30" />

            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className="space-y-3"
            >
              {items.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className={`
                    relative bg-card border-2 rounded-xl p-4 cursor-grab active:cursor-grabbing
                    transition-colors duration-200
                    ${
                      showFeedback
                        ? item.order === index + 1
                          ? "border-success bg-success/10"
                          : "border-error bg-error/10"
                        : "border-muted/20 hover:border-accent/50"
                    }
                  `}
                  whileDrag={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(255, 77, 109, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Timeline dot */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-xl
                        ${
                          showFeedback && item.order === index + 1
                            ? "bg-success"
                            : showFeedback
                            ? "bg-error"
                            : "bg-card border-2 border-accent/30"
                        }
                      `}
                    >
                      {item.emoji}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {item.text}
                      </p>
                      {showFeedback && isCorrect && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-muted mt-1"
                        >
                          {item.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Drag handle */}
                    <div className="text-muted/40">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <circle cx="7" cy="5" r="1.5" />
                        <circle cx="13" cy="5" r="1.5" />
                        <circle cx="7" cy="10" r="1.5" />
                        <circle cx="13" cy="10" r="1.5" />
                        <circle cx="7" cy="15" r="1.5" />
                        <circle cx="13" cy="15" r="1.5" />
                      </svg>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Check Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={checkOrder}
              disabled={isChecking}
              className="group relative px-10 py-4 bg-accent text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,77,109,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">
                {isChecking ? "CHECKING..." : "CHECK ORDER"}
              </span>
            </button>
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && !isCorrect && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-error mt-4 font-medium"
              >
                Not quite right. Try again!
              </motion.p>
            )}
            {showFeedback && isCorrect && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-success mt-4 font-medium"
              >
                Look at that evolution. Elite growth. 💕
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelComplete
          level={3}
          xpEarned={20}
          message="Our timeline is perfectly aligned."
          nextRoute="/level-4-intuition"
          nextLabel="NEXT LEVEL"
        />
      )}
    </main>
  );
}
