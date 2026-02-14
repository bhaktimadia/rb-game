"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useBackgroundMusic } from "@/hooks/useSound";
import { useRouter } from "next/navigation";
import GameIcon, { IconType } from "@/components/GameIcon";

interface Card {
  id: number;
  iconType: IconType;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
  justMatched: boolean; // For match animation
}

interface FloatingXP {
  id: number;
  x: number;
  y: number;
}

interface ChakraParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const cardPairs: { iconType: IconType; name: string }[] = [
  { iconType: "naruto", name: "Naruto" },
  { iconType: "driving", name: "Driving" },
  { iconType: "arcade", name: "Arcade" },
  { iconType: "popcorn", name: "Popcorn" },
  { iconType: "coke", name: "Coke" },
  { iconType: "flower", name: "Flower" },
  { iconType: "photos", name: "Photos" },
  { iconType: "love", name: "Love" },
  { iconType: "cuddle", name: "Cuddle" },
  { iconType: "movies", name: "Movies" },
];

const XP_PER_MATCH = 20;
const TOTAL_PAIRS = cardPairs.length;

export default function Level1() {
  const router = useRouter();
  const { addXP, addScrollFragment, addClue, completeLevel } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  
  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  
  // Animation state
  const [floatingXPs, setFloatingXPs] = useState<FloatingXP[]>([]);
  const [xpBarGlow, setXpBarGlow] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showFinalGlow, setShowFinalGlow] = useState(false);
  const [gridLocked, setGridLocked] = useState(false);
  const [showScrollAnimation, setShowScrollAnimation] = useState(false);
  const [particles, setParticles] = useState<ChakraParticle[]>([]);
  
  // XP display for smooth animation
  const [displayXP, setDisplayXP] = useState(0);

  // Initialize chakra particles
  useEffect(() => {
    const newParticles: ChakraParticle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 4 + 6,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  // Start game background music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  // Initialize and shuffle cards
  useEffect(() => {
    const initialCards: Card[] = [];
    cardPairs.forEach((pair, index) => {
      initialCards.push({
        id: index * 2,
        iconType: pair.iconType,
        name: pair.name,
        isFlipped: false,
        isMatched: false,
        justMatched: false,
      });
      initialCards.push({
        id: index * 2 + 1,
        iconType: pair.iconType,
        name: pair.name,
        isFlipped: false,
        isMatched: false,
        justMatched: false,
      });
    });
    setCards(initialCards.sort(() => Math.random() - 0.5));
  }, []);

  // Trigger XP bar glow
  const triggerXPGlow = useCallback(() => {
    setXpBarGlow(true);
    setTimeout(() => setXpBarGlow(false), 600);
  }, []);

  // Add floating XP animation
  const addFloatingXP = useCallback((cardElement: HTMLElement | null) => {
    if (!cardElement) return;
    
    const rect = cardElement.getBoundingClientRect();
    const newXP: FloatingXP = {
      id: Date.now(),
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
    
    setFloatingXPs(prev => [...prev, newXP]);
    setTimeout(() => {
      setFloatingXPs(prev => prev.filter(xp => xp.id !== newXP.id));
    }, 1500);
  }, []);

  const handleCardClick = (cardId: number, event: React.MouseEvent) => {
    if (isChecking || gridLocked) return;

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

      if (firstCard.name === secondCard.name) {
        // Match found!
        setTimeout(() => {
          // Mark as matched with justMatched for animation
          setCards((prev) =>
            prev.map((c) =>
              c.name === firstCard.name 
                ? { ...c, isMatched: true, justMatched: true } 
                : c
            )
          );
          
          // Add floating XP
          addFloatingXP(event.currentTarget as HTMLElement);
          
          // Update XP with animation
          addXP(XP_PER_MATCH);
          setDisplayXP(prev => prev + XP_PER_MATCH);
          triggerXPGlow();
          
          setMatchedPairs((prev) => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);

          // Clear justMatched after animation
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.name === firstCard.name 
                  ? { ...c, justMatched: false } 
                  : c
              )
            );
          }, 1000);
        }, 500);
      } else {
        // No match - flip back
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

  // Check for completion with cinematic moment
  useEffect(() => {
    if (matchedPairs === TOTAL_PAIRS && matchedPairs > 0) {
      // Lock grid
      setGridLocked(true);
      
      // Brief pause then show final glow
      setTimeout(() => {
        setShowFinalGlow(true);
      }, 500);
      
      // Then show scroll animation
      setTimeout(() => {
        setShowScrollAnimation(true);
      }, 1500);
      
      // Then show completion overlay
      setTimeout(() => {
        setShowCompletionOverlay(true);
      }, 2500);
    }
  }, [matchedPairs]);

  // Handle continue to next level
  const handleContinue = () => {
    addScrollFragment();
    addClue("The calm one was never truly alone.");
    completeLevel(1);
    router.push("/level-2");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 overflow-hidden">
      {/* Subtle Background Chakra Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gold/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Level Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 relative z-10"
      >
        <span className="text-crimson text-sm font-bold tracking-widest">
          LEVEL 1
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
          ORIGIN ARC
        </h1>
        <p className="text-muted text-sm mt-1">Memory Match Game</p>
      </motion.div>

      {/* Enhanced XP Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          w-full max-w-xs mb-4 relative z-10
          ${xpBarGlow ? "drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" : ""}
          transition-all duration-300
        `}
      >
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>XP PROGRESS</span>
          <span className="text-gold font-bold">{displayXP} / {TOTAL_PAIRS * XP_PER_MATCH}</span>
        </div>
        <div className="h-2 bg-card/50 rounded-full overflow-hidden border border-gold/20">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(displayXP / (TOTAL_PAIRS * XP_PER_MATCH)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-6 mb-6 relative z-10"
      >
        <div className="text-center">
          <p className="text-xs text-muted">MATCHES</p>
          <p className="text-2xl font-bold text-gold">{matchedPairs}/{TOTAL_PAIRS}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted">MOVES</p>
          <p className="text-2xl font-bold text-foreground">{moves}</p>
        </div>
      </motion.div>

      {/* Card Grid - 5x4 for 10 pairs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          grid grid-cols-5 gap-2 sm:gap-3 max-w-lg relative z-10
          ${gridLocked ? "pointer-events-none" : ""}
        `}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: showFinalGlow && card.isMatched ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              delay: index * 0.03,
              duration: 0.3,
              scale: { duration: 0.8, repeat: showFinalGlow ? 1 : 0 }
            }}
            onClick={(e) => handleCardClick(card.id, e)}
            className="w-[65px] h-[80px] sm:w-[85px] sm:h-[100px] cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            <div
              className="w-full h-full relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back (default view - ninja icon) */}
              <motion.div
                className={`
                  absolute w-full h-full rounded-lg flex items-center justify-center
                  bg-gradient-to-br from-card to-card/80 border-2 transition-colors duration-300
                  ${card.isMatched 
                    ? "border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]" 
                    : "border-crimson/30 hover:border-crimson hover:shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                  }
                `}
                initial={false}
                animate={{ 
                  rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                  opacity: card.isFlipped || card.isMatched ? 0 : 1,
                }}
                transition={{ 
                  duration: 0.4, 
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                style={{ backfaceVisibility: "hidden" }}
              >
                <GameIcon type="ninja" variant="neutral" size="md" showBadge={false} />
              </motion.div>

              {/* Card Front (revealed - GameIcon) */}
              <motion.div
                className={`
                  absolute w-full h-full rounded-lg flex items-center justify-center
                  ${card.isMatched 
                    ? "bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold" 
                    : "bg-gradient-to-br from-card to-card/80 border-2 border-crimson"
                  }
                `}
                initial={false}
                animate={{
                  rotateY: card.isFlipped || card.isMatched ? 0 : -180,
                  opacity: card.isFlipped || card.isMatched ? 1 : 0,
                  boxShadow: card.justMatched 
                    ? "0 0 30px rgba(255,215,0,0.8)"
                    : card.isMatched 
                      ? "0 0 15px rgba(255,215,0,0.4)"
                      : "0 0 0px rgba(255,215,0,0)",
                  scale: card.justMatched ? 1.08 : 1,
                }}
                transition={{ 
                  rotateY: { duration: 0.4, type: "spring", stiffness: 300, damping: 25 },
                  opacity: { duration: 0.3 },
                  boxShadow: { duration: 0.4, ease: "easeOut" },
                  scale: { duration: 0.3, ease: "easeOut" }
                }}
                style={{ backfaceVisibility: "hidden" }}
              >
                <GameIcon 
                  type={card.iconType} 
                  variant="memory" 
                  size="md" 
                  showBadge={false} 
                />
                
                {/* Match sparkle effect */}
                {card.justMatched && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-gold text-xs"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${10 + (i % 2) * 70}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0], 
                          scale: [0, 1, 0],
                          y: -10
                        }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        ✦
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating +XP Animations */}
      <AnimatePresence>
        {floatingXPs.map((xp) => (
          <motion.div
            key={xp.id}
            className="fixed pointer-events-none z-50 font-bold text-gold text-lg"
            style={{ left: xp.x, top: xp.y }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -60,
              scale: [0.5, 1.2, 1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            +{XP_PER_MATCH} XP ✨
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: gridLocked ? 0 : 1 }}
        className="text-center text-muted text-xs mt-6 relative z-10"
      >
        Tap cards to reveal • Find all matching pairs
      </motion.p>

      {/* Scroll Fragment Flying Animation */}
      <AnimatePresence>
        {showScrollAnimation && (
          <motion.div
            className="fixed z-50 text-4xl"
            initial={{ 
              left: "50%", 
              top: "50%",
              x: "-50%",
              y: "-50%",
              scale: 0,
              rotate: 0,
            }}
            animate={{ 
              left: "calc(100% - 60px)",
              top: "80px",
              x: 0,
              y: 0,
              scale: [0, 1.5, 1],
              rotate: [0, 360, 720],
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
            }}
          >
            📜
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCompletionOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
          >
            {/* Dim background */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            
            {/* Completion Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative z-50 text-center px-8 py-10 bg-gradient-to-br from-card/95 to-background/95 border-2 border-gold rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.3)] max-w-sm mx-4"
            >
              {/* Scroll Icon */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-4"
              >
                📜
              </motion.div>
              
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl font-bold text-gold mb-2"
              >
                Origin Arc Cleared
              </motion.h2>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted text-sm mb-2"
              >
                Scroll Fragment Obtained
              </motion.p>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-6 my-4 py-3 border-y border-gold/20"
              >
                <div className="text-center">
                  <p className="text-xs text-muted">XP EARNED</p>
                  <p className="text-xl font-bold text-gold">{displayXP}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted">MOVES</p>
                  <p className="text-xl font-bold text-foreground">{moves}</p>
                </div>
              </motion.div>
              
              {/* Clue */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm italic text-pink/80 mb-6"
              >
                &ldquo;The calm one was never truly alone.&rdquo;
              </motion.p>
              
              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255,215,0,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="px-8 py-3 bg-gradient-to-r from-gold to-yellow-500 text-background font-bold rounded-full shadow-lg transition-all"
              >
                Continue to Next Arc →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
