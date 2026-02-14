"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon from "@/components/GameIcon";

const GAME_DURATION = 30;
const BALANCE_THRESHOLD = 30; // Both meters should be within this range of 50

export default function Level4() {
  const { addXP } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [gameStarted, setGameStarted] = useState(false);
  const [animeMeter, setAnimeMeter] = useState(25); // Start low - needs more anime
  const [dramaMeter, setDramaMeter] = useState(75); // Start high - too much drama!
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balanceTime, setBalanceTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showAnimePopup, setShowAnimePopup] = useState(false);
  const [showDramaPopup, setShowDramaPopup] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  // Play game music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  const isBalanced = animeMeter >= (50 - BALANCE_THRESHOLD) && 
                     animeMeter <= (50 + BALANCE_THRESHOLD) &&
                     dramaMeter >= (50 - BALANCE_THRESHOLD) && 
                     dramaMeter <= (50 + BALANCE_THRESHOLD);

  const handleAnimeClick = useCallback(() => {
    setAnimeMeter((prev) => Math.min(prev + 15, 100));
    setDramaMeter((prev) => Math.max(prev - 8, 0));
    addXP(2);
    setTotalXPEarned((prev) => prev + 2);
  }, [addXP]);

  const handleDramaClick = useCallback(() => {
    setDramaMeter((prev) => Math.min(prev + 15, 100));
    setAnimeMeter((prev) => Math.max(prev - 8, 0));
    addXP(2);
    setTotalXPEarned((prev) => prev + 2);
  }, [addXP]);

  // Game timer and meter decay
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      // Timer countdown
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (balanceTime >= 10) {
            setIsComplete(true);
          } else {
            setFailed(true);
          }
          return 0;
        }
        return prev - 1;
      });

      // Meters naturally drift
      setAnimeMeter((prev) => {
        const drift = (Math.random() - 0.3) * 5; // Tends to increase
        return Math.max(0, Math.min(100, prev + drift));
      });
      setDramaMeter((prev) => {
        const drift = (Math.random() - 0.3) * 5;
        return Math.max(0, Math.min(100, prev + drift));
      });

      // Check balance
      if (isBalanced) {
        setBalanceTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, isBalanced, balanceTime]);

  // Random popups
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const animePopup = setInterval(() => {
      setShowAnimePopup(true);
      setTimeout(() => setShowAnimePopup(false), 2000);
    }, 4000);

    const dramaPopup = setInterval(() => {
      setShowDramaPopup(true);
      setTimeout(() => setShowDramaPopup(false), 2000);
    }, 5000);

    return () => {
      clearInterval(animePopup);
      clearInterval(dramaPopup);
    };
  }, [gameStarted, timeLeft]);

  const getScreenFilter = () => {
    if (animeMeter > 85) return "brightness(0.3)";
    if (dramaMeter > 85) return "saturate(2) hue-rotate(30deg)";
    return "none";
  };

  if (!gameStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center px-2"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-crimson/20 rounded-2xl p-4 sm:p-8">
            <span className="text-crimson text-xs sm:text-sm font-bold tracking-widest">
              LEVEL 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2 mb-4">
              ANIME DISTRACTION MODE
            </h1>
            <p className="text-sm sm:text-base text-muted mb-6 px-2">
              Balance the <span className="text-pink-glow">ANIME</span> and{" "}
              <span className="text-crimson">DRAMA</span> meters!
              <br />
              <span className="text-gold font-semibold text-xs sm:text-sm">
                Keep both balanced for 10 seconds to win.
              </span>
            </p>

            <div className="bg-background/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted mb-2">If meters go too high:</p>
              <div className="flex items-center justify-center gap-2 text-xs text-pink-glow">
                <GameIcon 
                  type="anime" 
                  variant="tap" 
                  size="sm" 
                  showBadge={false} 
                  backgroundColor="rgba(255, 105, 180, 0.3)"
                />
                <span>Too much anime = Screen blackout</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-crimson mt-1">
                <GameIcon 
                  type="drama" 
                  variant="avoid" 
                  size="sm" 
                  showBadge={false} 
                  backgroundColor="rgba(220, 20, 60, 0.3)"
                />
                <span>Too much drama = Chaos mode</span>
              </div>
            </div>

            <button
              onClick={() => setGameStarted(true)}
              className="px-10 py-4 bg-crimson text-white font-bold text-lg rounded-xl hover:scale-105 transition-all glow-crimson"
            >
              START BALANCING
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main 
      className="min-h-screen flex flex-col p-2 sm:p-4 relative z-10 transition-all duration-300"
      style={{ filter: getScreenFilter() }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 mt-4 sm:mt-8 px-2">
        <div className={`text-center ${timeLeft <= 10 ? "text-error" : ""}`}>
          <p className="text-[10px] sm:text-xs text-muted">TIME</p>
          <p className="text-xl sm:text-2xl font-bold">{timeLeft}s</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-muted">BALANCE TIME</p>
          <p className={`text-xl sm:text-2xl font-bold ${isBalanced ? "text-gold" : "text-muted"}`}>
            {balanceTime}/10s
          </p>
        </div>
      </div>

      {/* Balance Status - Only show when balanced */}
      <AnimatePresence>
        {isBalanced && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ 
              opacity: 1,
              scale: [1, 1.05, 1],
              y: 0,
              backgroundColor: "rgba(34, 197, 94, 0.2)"
            }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center py-3 px-6 rounded-xl mb-4 border border-emerald-500/30"
          >
            <p className="font-bold text-emerald-400">
              ✨ BALANCED! Keep it up!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meters */}
      <div className="flex-1 flex flex-col justify-center gap-8 max-w-md mx-auto w-full">
        {/* Anime Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-pink-glow font-bold flex items-center gap-2">
              <GameIcon 
                type="anime" 
                variant="tap" 
                size="sm" 
                showBadge={false} 
                backgroundColor="rgba(255, 105, 180, 0.5)"
              />
              ANIME
            </span>
            <span className="text-pink-glow">{Math.round(animeMeter)}%</span>
          </div>
          <div className="w-full h-8 bg-card rounded-full overflow-hidden border border-pink-glow/30">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-glow/50 to-pink-glow"
              animate={{ width: `${animeMeter}%` }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: animeMeter > 80 ? "0 0 20px rgba(255, 105, 180, 0.8)" : "none"
              }}
            />
          </div>
          {animeMeter > 80 && (
            <p className="text-xs text-error animate-pulse">⚠️ Screen darkening!</p>
          )}
        </div>

        {/* Drama Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-crimson font-bold flex items-center gap-2">
              <GameIcon 
                type="drama" 
                variant="avoid" 
                size="sm" 
                showBadge={false} 
                backgroundColor="rgba(220, 20, 60, 0.5)"
              />
              DRAMA
            </span>
            <span className="text-crimson">{Math.round(dramaMeter)}%</span>
          </div>
          <div className="w-full h-8 bg-card rounded-full overflow-hidden border border-crimson/30">
            <motion.div
              className="h-full bg-gradient-to-r from-crimson/50 to-crimson"
              animate={{ width: `${dramaMeter}%` }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: dramaMeter > 80 ? "0 0 20px rgba(220, 20, 60, 0.8)" : "none"
              }}
            />
          </div>
          {dramaMeter > 80 && (
            <p className="text-xs text-error animate-pulse">⚠️ Chaos increasing!</p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAnimeClick}
            className="py-5 bg-pink-glow/20 border-2 border-pink-glow rounded-xl text-pink-glow font-bold text-lg hover:bg-pink-glow/30 transition-all flex flex-col items-center gap-2"
          >
            <GameIcon 
              type="anime" 
              variant="tap" 
              size="md" 
              backgroundColor="rgba(255, 105, 180, 0.2)"
            />
            <span>WATCH ANIME</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDramaClick}
            className="py-5 bg-crimson/20 border-2 border-crimson rounded-xl text-crimson font-bold text-lg hover:bg-crimson/30 transition-all flex flex-col items-center gap-2"
          >
            <GameIcon 
              type="drama" 
              variant="avoid" 
              size="md" 
              backgroundColor="rgba(220, 20, 60, 0.2)"
            />
            <span>WATCH NATAK</span>
          </motion.button>
        </div>
      </div>

      {/* Anime Popup */}
      {showAnimePopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-pink-glow/90 text-background p-4 rounded-xl text-center font-bold flex items-center justify-center gap-3"
          onClick={handleAnimeClick}
        >
          <GameIcon 
            type="anime" 
            variant="tap" 
            size="sm" 
            showBadge={false} 
            backgroundColor="rgba(255, 105, 180, 0.9)"
          />
          NEW EPISODE DROPPED! TAP TO WATCH!
        </motion.div>
      )}

      {/* Drama Popup */}
      {showDramaPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-crimson/90 text-white p-4 rounded-xl text-center font-bold flex items-center justify-center gap-3"
          onClick={handleDramaClick}
        >
          <GameIcon 
            type="drama" 
            variant="avoid" 
            size="sm" 
            showBadge={false} 
            backgroundColor="rgba(220, 20, 60, 0.9)"
          />
          DRAMA STORM INCOMING! TAP TO UNLEASH!
        </motion.div>
      )}

      {/* Level Complete */}
      {isComplete && (
        <LevelComplete
          level={4}
          xpEarned={totalXPEarned}
          clue="Plot twists strengthen the bond."
          nextRoute="/level-5"
        />
      )}

      {/* Failed State */}
      {failed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/95 flex items-center justify-center z-50"
        >
          <div className="text-center p-8 max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <GameIcon 
                type="storm" 
                variant="avoid" 
                size="lg" 
                animated 
                backgroundColor="rgba(239, 68, 68, 0.3)"
              />
            </motion.div>
            <h2 className="text-2xl font-bold text-error mt-6 mb-2">
              BALANCE FAILED!
            </h2>
            <p className="text-muted mb-2">
              You maintained balance for only <span className="text-gold font-bold">{balanceTime}s</span> out of 10s required.
            </p>
            <p className="text-sm text-muted/70 mb-6">
              Remember: Too much anime OR too much drama both break the balance!
            </p>
            <button
              onClick={() => {
                setFailed(false);
                setGameStarted(false);
                setAnimeMeter(25);
                setDramaMeter(75);
                setTimeLeft(GAME_DURATION);
                setBalanceTime(0);
              }}
              className="px-8 py-3 bg-crimson text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              TRY AGAIN
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
