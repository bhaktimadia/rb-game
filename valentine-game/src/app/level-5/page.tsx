"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";
import { useBackgroundMusic } from "@/hooks/useSound";

const GRID_SIZE = 4; // 4x4 puzzle for better image quality
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

const PUZZLE_IMAGES = [
  { 
    id: 1, 
    src: "/puzzle-image-2.png", 
    name: "Comfort Is You",
    subtitle: "Complete to unlock this memory",
    completedText: "In your presence, I'm home"
  },
  { 
    id: 2, 
    src: "/puzzle-image-1.png", 
    name: "Our Kind of Fairytale",
    subtitle: "Complete to unlock this memory",
    completedText: "Where dreams met reality"
  },
  { 
    id: 3, 
    src: "/puzzle-image.png", 
    name: "The Day We Became Us",
    subtitle: "Complete to unlock this memory",
    completedText: "Forever began here"
  },
];

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
}

interface PuzzleState {
  pieces: PuzzlePiece[];
  moves: number;
  correctCount: number;
  isComplete: boolean;
  selectedPiece: number | null;
  draggedPiece: number | null;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Create shuffled puzzle - ensures puzzle is not already solved
function createShuffledPuzzle(): PuzzlePiece[] {
  let positions: number[];
  let attempts = 0;
  
  do {
    positions = shuffleArray(Array.from({ length: TOTAL_PIECES }, (_, i) => i));
    attempts++;
    // Check if puzzle is already solved (all pieces in correct position)
    const alreadySolved = positions.every((pos, index) => pos === index);
    if (!alreadySolved || attempts > 10) break;
  } while (attempts < 10);
  
  return positions.map((pos, index) => ({
    id: index,
    currentPosition: pos,
    correctPosition: index,
  }));
}

// Puzzle Component
function PuzzleGrid({ 
  puzzleId, 
  imageSrc, 
  puzzleName,
  puzzleSubtitle,
  puzzleCompletedText,
  puzzleState,
  allPuzzles,
  onUpdate 
}: { 
  puzzleId: number;
  imageSrc: string;
  puzzleName: string;
  puzzleSubtitle: string;
  puzzleCompletedText: string;
  puzzleState: PuzzleState;
  allPuzzles: Record<number, PuzzleState>;
  onUpdate: (updates: Partial<PuzzleState>) => void;
}) {
  const { addXP } = useGameStore();
  const [showCompletionAnim, setShowCompletionAnim] = useState(false);

  // Trigger completion animation
  useEffect(() => {
    if (puzzleState.isComplete && !showCompletionAnim) {
      setTimeout(() => {
        setShowCompletionAnim(true);
        // Play soft chime sound if available
        if (typeof window !== 'undefined' && (window as any).completeSound) {
          (window as any).completeSound.play();
        }
      }, 600);
    }
  }, [puzzleState.isComplete, showCompletionAnim]);

  // Check if other puzzles are incomplete
  const hasIncompletePuzzles = Object.values(allPuzzles).some(p => !p.isComplete);
  const shouldDim = hasIncompletePuzzles && !puzzleState.isComplete;

  // Get piece at a specific grid position
  const getPieceAtPosition = (position: number) => {
    return puzzleState.pieces.find(p => p.currentPosition === position);
  };

  // Calculate background position for a piece
  const getBackgroundPosition = (correctPosition: number) => {
    const row = Math.floor(correctPosition / GRID_SIZE);
    const col = correctPosition % GRID_SIZE;
    return {
      backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`,
    };
  };

  const handlePieceClick = useCallback((pieceId: number) => {
    if (puzzleState.isComplete) return;

    if (puzzleState.selectedPiece === null) {
      onUpdate({ selectedPiece: pieceId });
    } else if (puzzleState.selectedPiece === pieceId) {
      onUpdate({ selectedPiece: null });
    } else {
      // Swap pieces
      const newPieces = [...puzzleState.pieces];
      const piece1 = newPieces.find(p => p.id === puzzleState.selectedPiece)!;
      const piece2 = newPieces.find(p => p.id === pieceId)!;
      
      const tempPos = piece1.currentPosition;
      piece1.currentPosition = piece2.currentPosition;
      piece2.currentPosition = tempPos;
      
      onUpdate({ 
        pieces: newPieces, 
        moves: puzzleState.moves + 1,
        selectedPiece: null 
      });
      addXP(5);
    }
  }, [puzzleState, onUpdate, addXP]);

  const handleDragStart = (e: React.DragEvent, pieceId: number) => {
    if (puzzleState.isComplete) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("pieceId", pieceId.toString());
    e.dataTransfer.setData("puzzleId", puzzleId.toString());
    onUpdate({ draggedPiece: pieceId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetPieceId: number) => {
    e.preventDefault();
    
    const draggedPieceId = parseInt(e.dataTransfer.getData("pieceId"));
    const sourcePuzzleId = parseInt(e.dataTransfer.getData("puzzleId"));
    
    // Only allow swaps within the same puzzle
    if (sourcePuzzleId !== puzzleId) {
      onUpdate({ draggedPiece: null });
      return;
    }
    
    if (puzzleState.isComplete || draggedPieceId === targetPieceId) {
      onUpdate({ draggedPiece: null });
      return;
    }

    // Swap pieces
    const newPieces = [...puzzleState.pieces];
    const piece1 = newPieces.find(p => p.id === draggedPieceId)!;
    const piece2 = newPieces.find(p => p.id === targetPieceId)!;
    
    const tempPos = piece1.currentPosition;
    piece1.currentPosition = piece2.currentPosition;
    piece2.currentPosition = tempPos;
    
    onUpdate({ 
      pieces: newPieces, 
      moves: puzzleState.moves + 1,
      draggedPiece: null 
    });
    addXP(5);
  };

  const handleDragEnd = () => {
    onUpdate({ draggedPiece: null });
  };

  if (puzzleState.pieces.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: shouldDim ? 0.95 : 1,
        y: 0 
      }}
      transition={{ duration: 0.3 }}
      className="flex-shrink-0 w-[320px] md:w-[380px] relative"
    >
      {/* Vignette effect for completed puzzles */}
      {puzzleState.isComplete && (
        <div 
          className="absolute -inset-2 rounded-3xl pointer-events-none z-0"
          style={{
            boxShadow: "inset 0 0 40px rgba(255, 215, 0, 0.15), 0 0 20px rgba(255, 215, 0, 0.1)",
          }}
        />
      )}

      {/* Puzzle Header */}
      <div className="text-center mb-3 relative z-10">
        <h3 className="text-lg font-bold text-foreground mb-0.5">{puzzleName}</h3>
        {!puzzleState.isComplete && (
          <p className="text-[10px] text-muted/70 italic">{puzzleSubtitle}</p>
        )}
        {puzzleState.isComplete && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[11px] text-emerald-400/90 italic font-light"
          >
            {puzzleCompletedText}
          </motion.p>
        )}
        {!puzzleState.isComplete && (
          <div className="flex gap-3 justify-center text-xs mt-1">
            <div>
              <span className="text-muted">Correct: </span>
              <span className="text-gold font-bold">{puzzleState.correctCount}/{TOTAL_PIECES}</span>
            </div>
            <div>
              <span className="text-muted">Moves: </span>
              <span className="text-foreground font-bold">{puzzleState.moves}</span>
            </div>
          </div>
        )}
      </div>

      {/* Puzzle Grid */}
      <div
        className="relative bg-card/50 p-1.5 rounded-2xl border-2 border-gold/30 mx-auto transition-all duration-500"
        style={{
          boxShadow: puzzleState.isComplete 
            ? "0 0 40px rgba(255, 215, 0, 0.3), 0 0 60px rgba(34, 197, 94, 0.2)" 
            : "0 0 30px rgba(255,215,0,0.2)",
          width: "100%",
        }}
      >
        {/* Gold glow pulse for completed puzzles */}
        {puzzleState.isComplete && (
          <motion.div
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
            style={{
              boxShadow: "inset 0 0 60px rgba(255, 215, 0, 0.4)",
            }}
          />
        )}
        <div 
          className="grid gap-0.5 relative"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: "100%",
            aspectRatio: "1/1",
          }}
        >
          {Array.from({ length: TOTAL_PIECES }).map((_, position) => {
            const piece = getPieceAtPosition(position);
            if (!piece) return null;
            
            const isSelected = puzzleState.selectedPiece === piece.id;
            const isCorrect = piece.currentPosition === piece.correctPosition;
            const isDragging = puzzleState.draggedPiece === piece.id;
            
            return (
              <div
                key={piece.id}
                draggable={!puzzleState.isComplete}
                onDragStart={(e) => handleDragStart(e, piece.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, piece.id)}
                onDragEnd={handleDragEnd}
                onClick={() => handlePieceClick(piece.id)}
                className={`
                  relative aspect-square rounded-sm overflow-hidden cursor-move
                  transition-all duration-200
                  ${isSelected ? "ring-4 ring-gold scale-105 z-10" : ""}
                  ${isDragging ? "opacity-50 scale-95" : ""}
                  ${puzzleState.isComplete ? "cursor-default" : "hover:scale-[1.02]"}
                `}
                style={{
                  backgroundImage: `url('${imageSrc}')`,
                  backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                  backgroundRepeat: "no-repeat",
                  ...getBackgroundPosition(piece.correctPosition),
                  touchAction: "none",
                }}
              >
                {/* Overlay for selected state */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gold/20 animate-pulse" />
                )}
                
                {/* Green checkmark for correct pieces */}
                {isCorrect && !puzzleState.isComplete && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow-lg"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Overlay Animation */}
        <AnimatePresence>
          {puzzleState.isComplete && (
            <>
              {/* Gold glow sweep */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ 
                  x: "100%",
                  opacity: [0, 0.6, 0],
                }}
                transition={{ 
                  duration: 1.2,
                  ease: "easeInOut",
                  delay: 0.6
                }}
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
                }}
              />
              
              {/* Sparkle and overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-br from-emerald-500/10 to-gold/10 rounded-xl z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: [0, 1.3, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: 1.0,
                    ease: "backOut"
                  }}
                  className="text-6xl opacity-50"
                >
                  ✨
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {showCompletionAnim && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-3 text-center relative z-10"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-flex items-center justify-center gap-2 mb-1"
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.25, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-xl text-crimson"
              >
                ❤️
              </motion.span>
            </motion.div>
            <p className="text-sm font-medium text-emerald-400">Memory Unlocked</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Level Component
export default function Level5() {
  const { playMusic } = useBackgroundMusic();
  const [puzzles, setPuzzles] = useState<Record<number, PuzzleState>>({});
  const [allComplete, setAllComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showingCompletion, setShowingCompletion] = useState(false);
  const [showEmotionalOverlay, setShowEmotionalOverlay] = useState(false);

  // Play game music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  // Initialize all puzzles
  useEffect(() => {
    const initialPuzzles: Record<number, PuzzleState> = {};
    PUZZLE_IMAGES.forEach(image => {
      initialPuzzles[image.id] = {
        pieces: createShuffledPuzzle(),
        moves: 0,
        correctCount: 0,
        isComplete: false,
        selectedPiece: null,
        draggedPiece: null,
      };
    });
    setPuzzles(initialPuzzles);
    // Mark as initialized after a brief delay to ensure render is complete
    setTimeout(() => setInitialized(true), 100);
  }, []);

  // Check completion for each puzzle
  useEffect(() => {
    // Don't check until initialized
    if (!initialized || Object.keys(puzzles).length === 0) return;

    const updatedPuzzles = { ...puzzles };
    let hasChanges = false;

    Object.keys(updatedPuzzles).forEach(key => {
      const puzzleId = parseInt(key);
      const puzzle = updatedPuzzles[puzzleId];
      
      if (puzzle.pieces.length === 0) return;
      
      const correct = puzzle.pieces.filter(p => p.currentPosition === p.correctPosition).length;
      
      if (correct !== puzzle.correctCount) {
        puzzle.correctCount = correct;
        hasChanges = true;
      }
      
      // Only mark complete if correct count is full AND player has made at least 1 move
      // This ensures the player actually played the puzzle
      if (correct === TOTAL_PIECES && puzzle.moves > 0 && !puzzle.isComplete) {
        puzzle.isComplete = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setPuzzles(updatedPuzzles);
    }

    // Check if all puzzles are complete - only if initialized and they all have been played
    const allPuzzlesPlayed = Object.values(updatedPuzzles).every(p => p.moves > 0);
    const allDone = Object.values(updatedPuzzles).every(p => p.isComplete);
    
    if (initialized && allDone && allPuzzlesPlayed && !allComplete && !showingCompletion) {
      setShowingCompletion(true);
      setShowEmotionalOverlay(true);
      
      // Trigger confetti
      if (typeof window !== 'undefined' && (window as any).confetti) {
        setTimeout(() => {
          (window as any).confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
        setTimeout(() => {
          (window as any).confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 800);
        setTimeout(() => {
          (window as any).confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 800);
      }
      
      // Hide emotional overlay after 3 seconds and show level complete
      setTimeout(() => {
        setShowEmotionalOverlay(false);
        setTimeout(() => setAllComplete(true), 300);
      }, 3500);
    }
  }, [puzzles, allComplete, initialized, showingCompletion]);

  const updatePuzzle = (puzzleId: number, updates: Partial<PuzzleState>) => {
    setPuzzles(prev => ({
      ...prev,
      [puzzleId]: {
        ...prev[puzzleId],
        ...updates,
      }
    }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 py-4 sm:py-8 relative z-10 overflow-x-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <span className="text-crimson text-sm font-bold tracking-widest">
          LEVEL 5 – FINAL BOSS
        </span>
        <h1 className="text-3xl font-bold text-foreground mt-2">
          LOVE MODE
        </h1>
        <p className="text-muted text-sm mt-1">Complete All Three Jigsaw Puzzles</p>
      </motion.div>

      {/* Instructions */}
      <p className="text-muted text-xs mb-6 text-center">
        Drag pieces to swap them • Tap to select & swap • Complete all memories
      </p>

      {/* All Puzzles Horizontally */}
      <div className="flex flex-row gap-3 md:gap-5 items-start justify-start lg:justify-center w-full pb-8 overflow-x-auto px-2">
        {PUZZLE_IMAGES.map((image) => (
          puzzles[image.id] && (
            <PuzzleGrid
              key={image.id}
              puzzleId={image.id}
              imageSrc={image.src}
              puzzleName={image.name}
              puzzleSubtitle={image.subtitle}
              puzzleCompletedText={image.completedText}
              puzzleState={puzzles[image.id]}
              allPuzzles={puzzles}
              onUpdate={(updates) => updatePuzzle(image.id, updates)}
            />
          )
        ))}
      </div>

      {/* Emotional overlay when all complete */}
      <AnimatePresence>
        {showEmotionalOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-gradient-to-br from-background via-background/98 to-crimson/5 backdrop-blur-lg flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center px-6 max-w-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.3, 1],
                }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.8, 
                  ease: "backOut" 
                }}
                className="mb-8 inline-block"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.2
                  }}
                  className="text-7xl filter drop-shadow-2xl"
                >
                  💕
                </motion.div>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-4xl font-bold text-foreground mb-4 leading-tight"
              >
                You completed our story
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="text-2xl text-crimson font-medium"
              >
                Happy Valentine's <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                  className="inline-block"
                >
                  ❤️
                </motion.span>
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Complete */}
      {allComplete && (
        <LevelComplete
          level={5}
          xpEarned={0}
          clue="Love pieced together, moment by moment."
          nextRoute="/level-6"
        />
      )}
    </main>
  );
}
