"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useRouter } from "next/navigation";
import Confetti from "@/components/Confetti";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon from "@/components/GameIcon";

const WORDS = [
  "TOGETHER", "FOREVER", "LOYAL", "GROWTH", "SPARK", "BALANCE",
  "TRAVEL", "ADVENTURE", "MEMORIES", "CALM", "CUDDLE",
  "HOME", "TRUST", "JOURNEY"
];

// Special words that trigger enhanced effects
const SPECIAL_WORDS = ["TRAVEL", "ADVENTURE", "TOGETHER", "FOREVER", "NATAK"];

// Calculate optimal grid size based on word list
const calculateGridSize = (words: string[]) => {
  const longestWord = Math.max(...words.map(w => w.length));
  const wordCount = words.length;
  // Ensure grid is large enough: at least longest word + buffer, and scales with word count
  return Math.max(longestWord + 2, Math.ceil(Math.sqrt(wordCount * longestWord)) + 2);
};

const GRID_SIZE = calculateGridSize(WORDS);

// Dynamic grid generation with all words placement
const generateGrid = () => {
  const maxAttempts = 100;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill("")
    );
    
    const directions = [
      "horizontal",
      "horizontal-reverse",
      "vertical",
      "vertical-reverse",
      "diagonal-down",
      "diagonal-up",
      "diagonal-down-reverse",
      "diagonal-up-reverse"
    ];
    
    // Helper function to get cell position
    const getCell = (row: number, col: number, idx: number, dir: string) => {
      let r = row, c = col;
      
      switch(dir) {
        case "horizontal": c = col + idx; break;
        case "horizontal-reverse": c = col - idx; break;
        case "vertical": r = row + idx; break;
        case "vertical-reverse": r = row - idx; break;
        case "diagonal-down": r = row + idx; c = col + idx; break;
        case "diagonal-up": r = row - idx; c = col + idx; break;
        case "diagonal-down-reverse": r = row + idx; c = col - idx; break;
        case "diagonal-up-reverse": r = row - idx; c = col - idx; break;
      }
      
      return { r, c };
    };
    
    // Check if word can be placed at position
    const canPlaceWord = (word: string, row: number, col: number, dir: string): boolean => {
      for (let i = 0; i < word.length; i++) {
        const { r, c } = getCell(row, col, i, dir);
        
        // Check bounds
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
          return false;
        }
        
        // Check if cell is empty or has matching letter
        if (grid[r][c] && grid[r][c] !== word[i]) {
          return false;
        }
      }
      return true;
    };
    
    // Place word on grid
    const placeWord = (word: string, row: number, col: number, dir: string) => {
      for (let i = 0; i < word.length; i++) {
        const { r, c } = getCell(row, col, i, dir);
        grid[r][c] = word[i];
      }
    };
    
    // Try to place a word with retries
    const tryPlaceWord = (word: string): boolean => {
      const attempts = 50;
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < attempts; i++) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        const dir = shuffledDirections[i % shuffledDirections.length];
        
        if (canPlaceWord(word, row, col, dir)) {
          placeWord(word, row, col, dir);
          return true;
        }
      }
      return false;
    };
    
    // Try to place all words
    const sortedWords = [...WORDS].sort((a, b) => b.length - a.length); // Longest first
    let allPlaced = true;
    
    for (const word of sortedWords) {
      if (!tryPlaceWord(word)) {
        allPlaced = false;
        break;
      }
    }
    
    if (!allPlaced) continue;
    
    // Validate all words exist in grid
    const validateGrid = (): boolean => {
      for (const word of WORDS) {
        let found = false;
        
        // Check all positions and directions
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            for (const dir of directions) {
              let match = true;
              for (let i = 0; i < word.length; i++) {
                const { r, c } = getCell(row, col, i, dir);
                if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || grid[r][c] !== word[i]) {
                  match = false;
                  break;
                }
              }
              if (match) {
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (found) break;
        }
        
        if (!found) return false;
      }
      return true;
    };
    
    if (!validateGrid()) continue;
    
    // Fill remaining cells with random letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r][c]) {
          grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    return grid;
  }
  
  // Fallback: return empty grid if generation fails
  console.warn("Failed to generate valid grid after max attempts");
  return Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill("").map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)])
  );
};

export default function Level7() {
  const router = useRouter();
  const { addXP, addScrollFragment, addClue, completeLevel, scrollFragments } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [showScrollAssembly, setShowScrollAssembly] = useState(true);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showFinalWordMessage, setShowFinalWordMessage] = useState(false);
  const [justFoundWord, setJustFoundWord] = useState<string | null>(null);
  const [showGoldGlow, setShowGoldGlow] = useState(false);
  const [invalidSelection, setInvalidSelection] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Play game music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  useEffect(() => {
    setGrid(generateGrid());
  }, []);

  // Skip assembly if coming back
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollAssembly(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const handleSelectionStart = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    setCurrentWord(grid[row][col]);
  };

  const handleSelectionMove = useCallback((row: number, col: number) => {
    if (!isSelecting) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell || (lastCell.row === row && lastCell.col === col)) return;

    // Check if adjacent (including diagonal)
    const isAdjacent = Math.abs(lastCell.row - row) <= 1 && Math.abs(lastCell.col - col) <= 1;
    if (!isAdjacent) return;

    // Check if already selected
    const alreadySelected = selectedCells.some((c) => c.row === row && c.col === col);
    if (alreadySelected) return;

    setSelectedCells([...selectedCells, { row, col }]);
    setCurrentWord((prev) => prev + grid[row][col]);
  }, [isSelecting, selectedCells, grid]);

  const handleSelectionEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    // Check both forward and reverse of selected word
    const reversedWord = currentWord.split("").reverse().join("");
    const matchedWord = WORDS.includes(currentWord) ? currentWord : 
                        WORDS.includes(reversedWord) ? reversedWord : null;

    if (matchedWord && !foundWords.includes(matchedWord)) {
      // Found a word!
      const newFoundWords = [...foundWords, matchedWord];
      setFoundWords(newFoundWords);
      setJustFoundWord(matchedWord);
      
      // Clear just found word animation after delay
      setTimeout(() => setJustFoundWord(null), 1000);

      // Award XP with smooth animation (bonus for special words)
      const isSpecialWord = SPECIAL_WORDS.includes(matchedWord);
      const xpAmount = isSpecialWord ? 35 : 25;
      addXP(xpAmount);

      // Mark cells as found with gold glow effect
      const newFoundCells = new Set(foundCells);
      selectedCells.forEach((cell) => {
        newFoundCells.add(getCellKey(cell.row, cell.col));
      });
      setFoundCells(newFoundCells);

      // Enhanced glow for special words
      if (isSpecialWord) {
        setShowGoldGlow(true);
        setTimeout(() => setShowGoldGlow(false), 1500);
      }

      // Check if this is the last word before completion
      const isLastWord = newFoundWords.length === WORDS.length - 1;
      const isComplete = newFoundWords.length === WORDS.length;

      if (isLastWord) {
        // One word remaining - show encouragement
        setShowGoldGlow(true);
        setTimeout(() => setShowGoldGlow(false), 2000);
      } else if (isComplete) {
        // All words found - show intermediate message first
        setShowGoldGlow(true);
        setTimeout(() => {
          setShowFinalWordMessage(true);
          setTimeout(() => {
            setShowFinalWordMessage(false);
            setShowGoldGlow(false);
            setShowComplete(true);
          }, 2500);
        }, 800);
      }
    } else if (currentWord.length >= 2) {
      // Invalid selection - show soft feedback
      setInvalidSelection(true);
      setTimeout(() => setInvalidSelection(false), 400);
    }

    setSelectedCells([]);
    setCurrentWord("");
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !gridRef.current) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    
    if (element?.dataset?.row && element?.dataset?.col) {
      handleSelectionMove(
        parseInt(element.dataset.row),
        parseInt(element.dataset.col)
      );
    }
  };

  const handleComplete = () => {
    addXP(300); // Bonus XP for finale
    addScrollFragment();
    addClue("Seven memories assembled. The treasure awaits.");
    completeLevel(7);
    router.push("/treasure");
  };

  if (showScrollAssembly) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div className="text-center">
          <h2 className="text-2xl font-bold text-gold mb-8">
            SCROLL FRAGMENTS ASSEMBLING...
          </h2>
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotate: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  rotate: 0,
                  x: (i - 2.5) * -10 // Move towards center
                }}
                transition={{ delay: i * 0.3, duration: 0.5 }}
                className="w-14 h-18 bg-gradient-to-b from-gold/30 to-gold-dark/30 border-2 border-gold rounded flex items-center justify-center"
              >
                <GameIcon type="scroll" variant="neutral" size="sm" showBadge={false} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-muted"
          >
            <p>Final challenge awaits...</p>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-2 sm:p-4 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 mt-4 sm:mt-6 px-2"
      >
        <span className="text-gold text-xs sm:text-sm font-bold tracking-widest">
          LEVEL 7 – FINAL
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-2">
          SECRET ROOM OF REQUIREMENTS
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1">Find all hidden words</p>
      </motion.div>

      {/* Current Selection */}
      <div className="h-10 mb-4">
        {currentWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card px-4 py-2 rounded-xl border-2 border-gold"
          >
            <span className="text-gold font-bold tracking-wider">{currentWord}</span>
          </motion.div>
        )}
      </div>

      {/* Word Grid */}
      <motion.div
        ref={gridRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/30 p-1 sm:p-2 rounded-2xl border border-gold/30 select-none touch-none max-w-full overflow-x-auto"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleSelectionEnd}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const key = getCellKey(rowIndex, colIndex);
              const isFound = foundCells.has(key);
              const isSelected = selectedCells.some(
                (c) => c.row === rowIndex && c.col === colIndex
              );

              return (
                <motion.button
                  key={key}
                  data-row={rowIndex}
                  data-col={colIndex}
                  onMouseDown={() => handleSelectionStart(rowIndex, colIndex)}
                  onMouseEnter={() => handleSelectionMove(rowIndex, colIndex)}
                  onTouchStart={() => handleSelectionStart(rowIndex, colIndex)}
                  animate={
                    isFound ? { 
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        "0 0 0px rgba(212, 175, 55, 0)",
                        "0 0 25px rgba(212, 175, 55, 0.9)",
                        "0 0 10px rgba(212, 175, 55, 0.3)"
                      ]
                    } : invalidSelection && isSelected ? {
                      scale: [1, 0.95, 1],
                      backgroundColor: ["rgba(220, 38, 38, 0.2)", "rgba(220, 38, 38, 0.4)", "rgba(220, 38, 38, 0.2)"]
                    } : {}
                  }
                  transition={{ duration: isFound ? 0.6 : 0.3, ease: "easeOut" }}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                    text-sm sm:text-base font-bold transition-all duration-150 relative
                    ${isFound 
                      ? "bg-gold/40 text-gold border-2 border-gold shadow-lg shadow-gold/30" 
                      : isSelected
                      ? "bg-blue-500/40 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/40 scale-105"
                      : "bg-card text-foreground border border-muted/20 hover:border-gold/50 hover:bg-card/80"
                    }
                  `}
                >
                  {letter}
                  {/* Selection order indicator for drag trail */}
                  {isSelected && !isFound && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                    >
                      {selectedCells.findIndex(c => c.row === rowIndex && c.col === colIndex) + 1}
                    </motion.div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Words to Find */}
      <div className="mt-6 w-full max-w-md">
        <motion.p 
          key={foundWords.length}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className="text-xs text-muted text-center mb-2"
        >
          WORDS: <span className="text-gold font-bold">{foundWords.length}</span>/{WORDS.length}
        </motion.p>
        <div className="flex flex-wrap justify-center gap-2">
          {WORDS.map((word) => {
            const isFound = foundWords.includes(word);
            const isJustFound = word === justFoundWord;
            return (
              <motion.span
                key={word}
                initial={isFound && isJustFound ? { scale: 0, rotateY: 0 } : false}
                animate={isFound && isJustFound ? { 
                  scale: [0, 1.2, 1],
                  rotateY: [0, 180, 360]
                } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`
                  px-3 py-1 rounded-full text-xs font-bold transition-all
                  ${isFound 
                    ? "bg-gold/30 text-gold line-through border border-gold/50" 
                    : "bg-card text-muted"
                  }
                `}
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Gold Glow Overlay */}
      <AnimatePresence>
        {showGoldGlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-40"
            style={{
              background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
              boxShadow: "inset 0 0 100px rgba(212, 175, 55, 0.3)"
            }}
          />
        )}
      </AnimatePresence>

      {/* Final Word Message */}
      <AnimatePresence>
        {showFinalWordMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px rgba(212, 175, 55, 0.5)",
                  "0 0 40px rgba(212, 175, 55, 0.8)",
                  "0 0 20px rgba(212, 175, 55, 0.5)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl sm:text-5xl font-bold text-gold text-center px-6"
            >
              Love is built. Not found.
            </motion.div>
            <Confetti trigger={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete State */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/95 flex items-center justify-center z-50"
          >
            <Confetti trigger={true} />
            <div className="text-center flex flex-col items-center px-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
                className="mb-6"
              >
                <GameIcon type="heart1" variant="neutral" size="lg" animated />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl sm:text-5xl font-bold text-gold mb-4"
              >
                You unlocked us.
              </motion.h2>
              
              {/* XP Bar Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6 w-full max-w-md"
              >
                <div className="bg-gold/20 border-2 border-gold rounded-xl p-4">
                  <p className="text-gold font-bold text-lg text-center mb-2">
                    +300 XP Bonus
                  </p>
                  <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full shadow-lg shadow-gold/50"
                    />
                  </div>
                  <p className="text-gold/70 text-sm mt-2 text-center">
                    Finale Complete
                  </p>
                </div>
              </motion.div>

              {/* Completion Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 150 }}
                className="mb-6 px-6 py-3 bg-gradient-to-br from-gold/30 to-gold-dark/30 border-2 border-gold rounded-full flex items-center gap-3 shadow-2xl shadow-gold/40"
              >
                <GameIcon type="treasure" variant="neutral" size="sm" showBadge={false} />
                <span className="text-gold font-bold text-lg">
                  Final Challenge Completed
                </span>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-foreground/80 mb-8 text-lg"
              >
                The treasure chest awaits...
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                onClick={handleComplete}
                className="px-10 py-4 bg-gold text-background font-bold text-lg rounded-xl hover:scale-105 transition-all glow-gold flex items-center gap-3"
              >
                <GameIcon type="treasure" variant="neutral" size="sm" showBadge={false} />
                OPEN TREASURE CHEST
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
