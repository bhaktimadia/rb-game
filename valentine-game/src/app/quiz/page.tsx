"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import Confetti from "@/components/Confetti";
import Polaroid from "@/components/Polaroid";
import {
  rounds,
  getTotalQuestions,
  getQuestionByGlobalIndex,
  isFirstQuestionOfRound,
  isLastQuestionOfRound,
} from "@/data/questions";

type GameState = "round-intro" | "question" | "round-end";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameState, setGameState] = useState<GameState>("round-intro");

  const totalQuestions = getTotalQuestions();
  const questionData = getQuestionByGlobalIndex(currentQuestionIndex);
  const currentRound = questionData?.round;
  const currentQuestion = questionData?.question;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = useCallback(
    (index: number) => {
      if (isAnswered || !currentQuestion) return;

      setSelectedAnswer(index);
      setIsAnswered(true);

      if (index === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
    },
    [isAnswered, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      router.push(`/results?score=${score}&total=${totalQuestions}`);
      return;
    }

    // Check if this is last question of round
    if (isLastQuestionOfRound(currentQuestionIndex) && currentRound?.endPhoto) {
      setGameState("round-end");
    } else {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);

      // Check if next question is first of new round
      if (isFirstQuestionOfRound(nextIndex)) {
        setGameState("round-intro");
      }
    }
  }, [isLastQuestion, currentQuestionIndex, currentRound, router, score, totalQuestions]);

  const handleContinueFromRoundEnd = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setGameState("round-intro");
  }, [currentQuestionIndex]);

  const handleStartRound = useCallback(() => {
    setGameState("question");
  }, []);

  const getAnswerStyle = (index: number) => {
    if (!isAnswered) {
      return selectedAnswer === index
        ? "border-accent bg-accent/10"
        : "border-muted/20 hover:border-accent/50 hover:bg-card/50";
    }

    if (index === currentQuestion?.correctAnswer) {
      return "border-success bg-success/10";
    }

    if (selectedAnswer === index && index !== currentQuestion?.correctAnswer) {
      return "border-error bg-error/10";
    }

    return "border-muted/20 opacity-50";
  };

  if (!currentRound || !currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <div className="animate-pulse">Loading...</div>
        </Card>
      </main>
    );
  }

  // ROUND INTRO SCREEN
  if (gameState === "round-intro") {
    return (
      <main className="min-h-screen flex flex-col p-4 relative z-10">
        <div className="max-w-2xl w-full mx-auto mb-6">
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={`round-intro-${currentRound.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full text-center"
          >
            <Card className="py-10">
              {/* Round Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className="text-accent text-sm font-bold tracking-widest">
                  {currentRound.title}
                </span>
              </motion.div>

              {/* Round Subtitle */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              >
                {currentRound.subtitle}
              </motion.h2>

              {/* Intro Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted text-lg mb-8"
              >
                {currentRound.intro}
              </motion.p>

              {/* Start Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="primary" size="lg" onClick={handleStartRound}>
                  BEGIN ROUND
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // ROUND END SCREEN (with photo)
  if (gameState === "round-end" && currentRound.endPhoto) {
    return (
      <main className="min-h-screen flex flex-col p-4 relative z-10">
        <div className="max-w-2xl w-full mx-auto mb-6">
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg w-full text-center"
          >
            <Card className="py-8">
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-foreground mb-6"
              >
                {currentRound.subtitle} Complete
              </motion.h3>

              {/* Polaroid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <Polaroid
                  caption={currentRound.endPhoto.caption}
                  rotation={currentRound.endPhoto.rotation}
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted mb-6"
              >
                Current Score: <span className="text-accent font-bold">{score}</span> / {currentQuestionIndex + 1}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="primary" size="lg" onClick={handleContinueFromRoundEnd}>
                  NEXT ROUND
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  // QUESTION SCREEN
  return (
    <main className="min-h-screen flex flex-col p-4 relative z-10">
      <Confetti trigger={showConfetti} />

      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full mx-auto mb-6"
      >
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
      </motion.div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            <Card>
              {/* Round indicator */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-accent tracking-wide">
                  {currentRound.title} – {currentRound.subtitle}
                </span>
                <span className="text-xs text-muted">
                  Q{questionData.questionInRound + 1}/4
                </span>
              </div>

              {/* Question */}
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                      ${getAnswerStyle(index)}
                      ${!isAnswered ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                          ${
                            isAnswered && index === currentQuestion.correctAnswer
                              ? "bg-success text-white"
                              : isAnswered &&
                                selectedAnswer === index &&
                                index !== currentQuestion.correctAnswer
                              ? "bg-error text-white"
                              : "bg-card border border-muted/30"
                          }
                        `}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-foreground">{option}</span>
                      {isAnswered && index === currentQuestion.correctAnswer && (
                        <span className="ml-auto text-success">✓</span>
                      )}
                      {isAnswered &&
                        selectedAnswer === index &&
                        index !== currentQuestion.correctAnswer && (
                          <span className="ml-auto text-error">✗</span>
                        )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Feedback & Next Button */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div
                      className={`
                        p-4 rounded-lg text-center font-medium
                        ${
                          selectedAnswer === currentQuestion.correctAnswer
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }
                      `}
                    >
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? currentQuestion.correctFeedback
                        : currentQuestion.wrongFeedback}
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleNext}
                    >
                      {isLastQuestion ? "SEE RESULTS" : "NEXT"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Score indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 text-muted text-sm"
            >
              Score: {score} / {currentQuestionIndex + (isAnswered ? 1 : 0)}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
