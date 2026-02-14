"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";

interface Card {
  id: number;
  content: string;
  type: "photo" | "text";
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const memoryPairs = [
  { photo: "📸", text: "Version 1.0", label: "Wedding Day" },
  { photo: "✈️", text: "First Trip", label: "Adventure Begins" },
  { photo: "💍", text: "Said Yes", label: "Engagement" },
  { photo: "🤳", text: "Drama Day", label: "Random Selfie" },
];

export default function Level1Memory() {
  const { xp } = useGameStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showUnlocked, setShowUnlocked] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);

  // Initialize cards
  useEffect(() => {
    const initialCards: Card[] = [];
    memoryPairs.forEach((pair, index) => {
      initialCards.push({
        id: index * 2,
        content: pair.photo,
        type: "photo",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
      initialCards.push({
        id: index * 2 + 1,
        content: pair.text,
        type: "text",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
    });
    // Shuffle
    setCards(initialCards.sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (cardId: number) => {
    if (isChecking) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = cards.find((c) => c.id === secondId)!;

      if (firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
            )
          );
          setShowUnlocked(memoryPairs[firstCard.pairId].label);
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);

          setTimeout(() => setShowUnlocked(null), 1500);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Check for completion
  useEffect(() => {
    if (matchedPairs === memoryPairs.length && matchedPairs > 0) {
      setTimeout(() => setIsComplete(true), 1000);
    }
  }, [matchedPairs]);

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
            LEVEL 1
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gold text-sm font-bold">XP: {xp}</span>
            <span className="text-xs text-muted">
              Moves: {moves}
            </span>
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
          MEMORY MATCH
        </h1>
        <p className="text-muted text-sm">
          Match the photos with their memories
        </p>
      </motion.div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flip-card w-16 h-20 sm:w-20 sm:h-24 cursor-pointer"
              onClick={() => handleCardClick(card.id)}
            >
              <div
                className={`flip-card-inner w-full h-full ${
                  card.isFlipped || card.isMatched ? "flipped" : ""
                }`}
              >
                {/* Front (hidden) */}
                <div className="flip-card-front absolute w-full h-full bg-card border-2 border-accent/30 rounded-xl flex items-center justify-center shadow-lg hover:border-accent/60 transition-colors">
                  <span className="text-2xl text-accent/60">♥</span>
                </div>

                {/* Back (revealed) */}
                <div
                  className={`flip-card-back absolute w-full h-full rounded-xl flex items-center justify-center p-2 ${
                    card.isMatched
                      ? "bg-success/20 border-2 border-success"
                      : "bg-card border-2 border-highlight"
                  }`}
                >
                  {card.type === "photo" ? (
                    <span className="text-3xl">{card.content}</span>
                  ) : (
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {card.content}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Memory Unlocked Popup */}
      <AnimatePresence>
        {showUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-card border border-success/50 rounded-xl px-6 py-3 shadow-lg"
          >
            <p className="text-success font-semibold text-sm flex items-center gap-2">
              <span>✨</span>
              Memory Unlocked: {showUnlocked}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-4 text-muted text-sm"
      >
        Matched: {matchedPairs} / {memoryPairs.length}
      </motion.div>

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelComplete
          level={1}
          xpEarned={20}
          message="Our memories are safe with you."
          nextRoute="/level-2-reaction"
          nextLabel="NEXT LEVEL"
        />
      )}
    </main>
  );
}
