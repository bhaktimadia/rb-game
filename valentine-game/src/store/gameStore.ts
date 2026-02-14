import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  xp: number;
  scrollFragments: number;
  completedLevels: number[];
  currentLevel: number;
  clues: string[];
  
  // Actions
  addXP: (amount: number) => void;
  addScrollFragment: () => void;
  addClue: (clue: string) => void;
  completeLevel: (level: number) => void;
  resetGame: () => void;
  isLevelUnlocked: (level: number) => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      scrollFragments: 0,
      completedLevels: [],
      currentLevel: 1,
      clues: [],

      addXP: (amount) =>
        set((state) => ({
          xp: Math.max(0, Math.min(state.xp + amount, 1000)),
        })),

      addScrollFragment: () =>
        set((state) => ({
          scrollFragments: Math.min(state.scrollFragments + 1, 7),
        })),

      addClue: (clue) =>
        set((state) => ({
          clues: state.clues.includes(clue)
            ? state.clues
            : [...state.clues, clue],
        })),

      completeLevel: (level) =>
        set((state) => ({
          completedLevels: state.completedLevels.includes(level)
            ? state.completedLevels
            : [...state.completedLevels, level],
          currentLevel: Math.max(state.currentLevel, level + 1),
        })),

      resetGame: () =>
        set({
          xp: 0,
          scrollFragments: 0,
          completedLevels: [],
          currentLevel: 1,
          clues: [],
        }),

      isLevelUnlocked: (level) => level <= get().currentLevel,
    }),
    {
      name: "love-no-jutsu-game",
    }
  )
);
