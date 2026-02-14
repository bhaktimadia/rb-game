"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";

interface Question {
  id: number;
  question: string;
  placeholder: string;
  reveal: string;
  emoji: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "I'm upset. What do I actually need?",
    placeholder: "Type your answer...",
    reveal: "Close. But what I really need is a hug + reassurance. Words aren't always enough.",
    emoji: "🤗",
  },
  {
    id: 2,
    question: "When I say 'do what you want', what should you do?",
    placeholder: "What's the right move?",
    reveal: "NOT what you want. Ask more questions. Figure out what I actually want.",
    emoji: "🎯",
  },
  {
    id: 3,
    question: "What's my love language?",
    placeholder: "How do I feel loved?",
    reveal: "Quality time + Words of affirmation. But mostly just your attention.",
    emoji: "💕",
  },
  {
    id: 4,
    question: "When I go quiet, what's usually happening?",
    placeholder: "What am I thinking?",
    reveal: "Overthinking. Always overthinking. Just hold my hand and let me process.",
    emoji: "💭",
  },
];

export default function Level4Intuition() {
  const { xp } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    setAnswers((prev) => [...prev, userAnswer]);
    setShowReveal(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setShowReveal(false);
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
            LEVEL 4
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gold text-sm font-bold">XP: {xp}</span>
            <span className="text-xs text-muted">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Level Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          INTUITION CHECK
        </h1>
        <p className="text-muted text-sm">
          No wrong answers. Just real talk.
        </p>
      </motion.div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-lg w-full"
          >
            <div className="bg-card/50 backdrop-blur-sm border border-muted/10 rounded-2xl p-6">
              {/* Question */}
              <div className="text-center mb-6">
                <span className="text-4xl mb-4 block">
                  {currentQuestion.emoji}
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Input or Reveal */}
              <AnimatePresence mode="wait">
                {!showReveal ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full bg-background/50 border border-muted/20 rounded-xl p-4 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      className="w-full mt-4 group relative px-8 py-3 bg-accent text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,77,109,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">SUBMIT</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Your Answer */}
                    <div className="bg-background/30 rounded-xl p-4">
                      <p className="text-xs text-muted mb-1">Your answer:</p>
                      <p className="text-foreground">{userAnswer}</p>
                    </div>

                    {/* Real Answer */}
                    <div className="bg-highlight/10 border border-highlight/30 rounded-xl p-4">
                      <p className="text-xs text-highlight mb-1 font-semibold">
                        The real answer:
                      </p>
                      <p className="text-foreground leading-relaxed">
                        {currentQuestion.reveal}
                      </p>
                    </div>

                    {/* Continue */}
                    <button
                      onClick={handleNext}
                      className="w-full group relative px-8 py-3 bg-accent text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,77,109,0.3)]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">
                        {isLastQuestion ? "COMPLETE LEVEL" : "NEXT QUESTION"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Encouragement */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted/60 text-xs mt-4"
            >
              This isn&apos;t about being right. It&apos;s about understanding.
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelComplete
          level={4}
          xpEarned={20}
          message="Intuition level: Advanced. You're learning me."
          nextRoute="/level-5-boss"
          nextLabel="BOSS LEVEL"
        />
      )}
    </main>
  );
}
