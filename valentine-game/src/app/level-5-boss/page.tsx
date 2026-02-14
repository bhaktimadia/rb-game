"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";

interface Scenario {
  id: number;
  situation: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    situation: "I'm overthinking at 11:47 PM. What do you do?",
    options: [
      { text: "Go to sleep", isCorrect: false, feedback: "Brave. But wrong." },
      { text: "Give a logical solution", isCorrect: false, feedback: "Logic? At midnight? Bold move." },
      { text: "Hug + just listen", isCorrect: true, feedback: "Perfect husband instinct activated." },
      { text: "Make a joke", isCorrect: false, feedback: "Risky. Could go either way." },
    ],
  },
  {
    id: 2,
    situation: "I say 'I'm fine.' What do you do?",
    options: [
      { text: "Believe her", isCorrect: false, feedback: "Oh you sweet innocent soul." },
      { text: "Ask what's wrong 3 times", isCorrect: true, feedback: "Persistence is key. You know the drill." },
      { text: "Give her space", isCorrect: false, feedback: "Sometimes works. Not this time." },
      { text: "Panic", isCorrect: false, feedback: "Valid response actually." },
    ],
  },
  {
    id: 3,
    situation: "I'm being lazy but pretending I'm not. What's your move?",
    options: [
      { text: "Call her out", isCorrect: false, feedback: "You chose violence today?" },
      { text: "Play along and pamper", isCorrect: true, feedback: "Smart. Very smart." },
      { text: "Ignore it", isCorrect: false, feedback: "Missed opportunity for brownie points." },
      { text: "Start being productive loudly", isCorrect: false, feedback: "Passive aggressive detected." },
    ],
  },
  {
    id: 4,
    situation: "We're arguing. She says 'whatever'. What now?",
    options: [
      { text: "Walk away", isCorrect: false, feedback: "Tactical retreat. Sometimes valid." },
      { text: "Keep arguing", isCorrect: false, feedback: "You want to lose, don't you?" },
      { text: "Pause. Then apologize.", isCorrect: true, feedback: "De-escalation expert mode." },
      { text: "Say 'whatever' back", isCorrect: false, feedback: "Mirror mode activated. Dangerous." },
    ],
  },
  {
    id: 5,
    situation: "She asks 'Do I look okay?' What's the only right answer?",
    options: [
      { text: "'Yeah you're fine'", isCorrect: false, feedback: "'Fine' is never the right word." },
      { text: "'You look amazing'", isCorrect: true, feedback: "This is the way." },
      { text: "'What's wrong with it?'", isCorrect: false, feedback: "Instant trap detected." },
      { text: "*Long pause*", isCorrect: false, feedback: "Too slow. Trust destroyed." },
    ],
  },
];

export default function Level5Boss() {
  const { xp } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const isLastScenario = currentIndex === scenarios.length - 1;

  const handleSelect = (optionIndex: number) => {
    if (showFeedback) return;
    
    setSelectedOption(optionIndex);
    setShowFeedback(true);

    if (currentScenario.options[optionIndex].isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastScenario) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const accuracy = Math.round((correctCount / scenarios.length) * 100);

  return (
    <main className="min-h-screen flex flex-col p-4 relative z-10">
      {/* Boss Level Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="bg-gradient-to-r from-accent to-highlight px-4 py-1 rounded-full">
          <span className="text-xs font-bold text-white tracking-widest">
            👑 BOSS LEVEL
          </span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto mb-6 mt-8 px-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold tracking-widest text-gold">
            FINAL ROUND
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gold text-sm font-bold">XP: {xp}</span>
            <span className="text-xs text-muted">
              {currentIndex + 1} / {scenarios.length}
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
          DECISION CHALLENGE
        </h1>
        <p className="text-muted text-sm">
          Real scenarios. Choose wisely.
        </p>
      </motion.div>

      {/* Scenario Card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full"
          >
            <div className="bg-card border-2 border-accent/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,77,109,0.1)]">
              {/* Scenario */}
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">🎬</span>
                <h2 className="text-lg sm:text-xl font-bold text-foreground leading-relaxed">
                  {currentScenario.situation}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentScenario.options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleSelect(index)}
                    disabled={showFeedback}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        showFeedback
                          ? option.isCorrect
                            ? "border-success bg-success/10"
                            : selectedOption === index
                            ? "border-error bg-error/10"
                            : "border-muted/20 opacity-50"
                          : "border-muted/20 hover:border-accent/50 cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${
                            showFeedback && option.isCorrect
                              ? "bg-success text-white"
                              : showFeedback && selectedOption === index
                              ? "bg-error text-white"
                              : "bg-background border border-muted/30"
                          }
                        `}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-foreground">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && selectedOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div
                      className={`
                        p-4 rounded-xl text-center font-medium
                        ${
                          currentScenario.options[selectedOption].isCorrect
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }
                      `}
                    >
                      {currentScenario.options[selectedOption].feedback}
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full group relative px-8 py-3 bg-accent text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,77,109,0.3)]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">
                        {isLastScenario ? "SEE FINAL RESULT" : "NEXT SCENARIO"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Current Score */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted text-sm mt-4"
            >
              Correct moves: {correctCount} / {currentIndex + (showFeedback ? 1 : 0)}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelComplete
          level={5}
          xpEarned={20}
          message={`Husband Instinct Level: ${accuracy}% Accurate`}
          nextRoute="/final"
          nextLabel="FINAL RESULTS"
        />
      )}
    </main>
  );
}
