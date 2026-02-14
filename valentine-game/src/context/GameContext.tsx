"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  gameState: {
    currentLevel: number;
    score: number;
    xp: number;
  };
  completeLevel: () => void;
  addScore: (points: number) => void;
  addXP: (points: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState({
    currentLevel: 1,
    score: 0,
    xp: 0,
  });

  const completeLevel = () => {
    setGameState((prev) => ({ ...prev, currentLevel: prev.currentLevel + 1 }));
  };

  const addScore = (points: number) => {
    setGameState((prev) => ({ ...prev, score: prev.score + points }));
  };

  const addXP = (points: number) => {
    setGameState((prev) => ({ ...prev, xp: prev.xp + points }));
  };

  return (
    <GameContext.Provider value={{ gameState, completeLevel, addScore, addXP }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
