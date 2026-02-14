"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon, { IconType } from "@/components/GameIcon";

interface DramaIcon {
  id: number;
  x: number;
  y: number;
  type: "drama" | "silence";
  iconType: IconType;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  isPositive: boolean;
}

const GAME_DURATION = 25;
const REQUIRED_DRAMA = 8;
const MAX_DRAMA = 15;
const ARENA_SIZE = 500; // Bigger arena - increased from 400

// XP Constants
const XP_PER_SECOND_IN_ZONE = 5;
const XP_PER_DRAMA_ICON = 10;
const XP_PENALTY_EXCEED = -20;
const XP_PENALTY_TOO_LOW = -10;
const XP_BASE_COMPLETION = 200;

export default function Level6() {
  const { addXP } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });
  const [icons, setIcons] = useState<DramaIcon[]>([]);
  const [dramaCollected, setDramaCollected] = useState(0);
  const [silenceCollected, setSilenceCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [showDimEffect, setShowDimEffect] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [balanceState, setBalanceState] = useState<"too-calm" | "perfect" | "overload">("too-calm");
  const [stayedInZone, setStayedInZone] = useState(true);
  const floatingTextIdRef = useRef(0);
  const lastDramaRef = useRef(0);
  const lastSecondTickRef = useRef(0);
  const iconIdRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Generate particle positions on client only
  const particles = useRef<Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    delay: number;
  }>>([]);

  // Initialize particles on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    particles.current = Array.from({ length: 15 }, () => ({
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100 + 50,
      endY: Math.random() * 100 + 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  // Add floating XP text
  const addFloatingText = useCallback((text: string, isPositive: boolean) => {
    const newText: FloatingText = {
      id: floatingTextIdRef.current++,
      text,
      x: ARENA_SIZE / 2,
      y: ARENA_SIZE / 2,
      isPositive,
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  }, []);

  // Update XP
  const updateXP = useCallback((amount: number, showText: boolean = true) => {
    setXpGained(prev => Math.max(0, prev + amount));
    if (showText) {
      addFloatingText(amount > 0 ? `+${amount} XP` : `${amount} XP`, amount > 0);
    }
  }, [addFloatingText]);

  // Update balance state
  useEffect(() => {
    if (!gameStarted) return;

    if (dramaCollected < REQUIRED_DRAMA) {
      setBalanceState("too-calm");
      if (dramaCollected < REQUIRED_DRAMA && lastDramaRef.current >= REQUIRED_DRAMA) {
        setStayedInZone(false);
      }
    } else if (dramaCollected >= REQUIRED_DRAMA && dramaCollected <= MAX_DRAMA) {
      setBalanceState("perfect");
    } else {
      setBalanceState("overload");
      setStayedInZone(false);
    }
  }, [dramaCollected, gameStarted]);

  // XP per second in safe zone
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || failed) return;

    const interval = setInterval(() => {
      const currentSecond = GAME_DURATION - timeLeft;
      if (currentSecond > lastSecondTickRef.current) {
        lastSecondTickRef.current = currentSecond;
        
        // Award XP if in safe zone (8-15)
        if (dramaCollected >= REQUIRED_DRAMA && dramaCollected <= MAX_DRAMA) {
          updateXP(XP_PER_SECOND_IN_ZONE, false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, dramaCollected, failed, updateXP]);

  // Check drama penalties
  useEffect(() => {
    if (!gameStarted || failed) return;

    const prevDrama = lastDramaRef.current;
    lastDramaRef.current = dramaCollected;

    // Penalty for exceeding max
    if (dramaCollected > MAX_DRAMA && prevDrama <= MAX_DRAMA) {
      updateXP(XP_PENALTY_EXCEED);
      setShowRedFlash(true);
      setTimeout(() => setShowRedFlash(false), 300);
    }

    // Penalty for dropping too low (only if player had achieved it before)
    if (dramaCollected < REQUIRED_DRAMA && prevDrama >= REQUIRED_DRAMA && prevDrama > 0) {
      updateXP(XP_PENALTY_TOO_LOW);
      setShowDimEffect(true);
      setTimeout(() => setShowDimEffect(false), 500);
    }
  }, [dramaCollected, gameStarted, failed, updateXP]);
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  const spawnIcon = useCallback(() => {
    const isDrama = Math.random() > 0.4; // 60% drama icons
    const dramaIcons: IconType[] = ["drama", "storm"];
    const silenceIcons: IconType[] = ["mute", "sleep"];
    
    const newIcon: DramaIcon = {
      id: iconIdRef.current++,
      x: Math.random() * (ARENA_SIZE - 60) + 30,
      y: Math.random() * (ARENA_SIZE - 60) + 30,
      type: isDrama ? "drama" : "silence",
      iconType: isDrama 
        ? dramaIcons[Math.floor(Math.random() * dramaIcons.length)]
        : silenceIcons[Math.floor(Math.random() * silenceIcons.length)],
    };
    setIcons((prev) => [...prev.slice(-12), newIcon]);
  }, []);

  // Check collision
  const checkCollision = useCallback((icon: DramaIcon) => {
    const distance = Math.sqrt(
      Math.pow(playerPos.x - icon.x, 2) + Math.pow(playerPos.y - icon.y, 2)
    );
    return distance < 35; // Slightly larger collision radius
  }, [playerPos]);

  // Handle movement
  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayerPos((prev) => ({
      x: Math.max(20, Math.min(ARENA_SIZE - 20, prev.x + dx)),
      y: Math.max(20, Math.min(ARENA_SIZE - 20, prev.y + dy)),
    }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 15;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          movePlayer(0, -speed);
          break;
        case "ArrowDown":
        case "s":
          movePlayer(0, speed);
          break;
        case "ArrowLeft":
        case "a":
          movePlayer(-speed, 0);
          break;
        case "ArrowRight":
        case "d":
          movePlayer(speed, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, timeLeft, movePlayer]);

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const dx = (e.touches[0].clientX - touchStartRef.current.x) * 0.5;
    const dy = (e.touches[0].clientY - touchStartRef.current.y) * 0.5;
    movePlayer(dx, dy);
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Mouse drag controls for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = (e.clientX - touchStartRef.current.x) * 0.5;
    const dy = (e.clientY - touchStartRef.current.y) * 0.5;
    movePlayer(dx, dy);
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  // Direct tap/click to move player to that position
  const handleArenaClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!arenaRef.current || isDragging.current) return;
    
    const rect = arenaRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setPlayerPos({
      x: Math.max(20, Math.min(ARENA_SIZE - 20, x)),
      y: Math.max(20, Math.min(ARENA_SIZE - 20, y)),
    });
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || failed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Check win/lose conditions
          if (dramaCollected >= REQUIRED_DRAMA && dramaCollected <= MAX_DRAMA) {
            // Calculate multiplier
            let mult = 1;
            if (dramaCollected >= 10 && dramaCollected <= 13) {
              mult = 1.2;
            }
            if (dramaCollected >= 11 && dramaCollected <= 12) {
              mult = 1.5;
            }
            setMultiplier(mult);
            
            // Schedule completion bonus outside of render
            setTimeout(() => {
              const bonusXP = stayedInZone ? XP_BASE_COMPLETION : 0;
              if (bonusXP > 0) {
                addXP(bonusXP);
              }
              setIsComplete(true);
            }, 100);
          } else if (dramaCollected < REQUIRED_DRAMA) {
            setFailed("Not enough spark! Marriage needs energy!");
          } else {
            setFailed("CHAOS OVERLOAD! Too much drama!");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, dramaCollected, failed, addXP]);

  // Spawn icons
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;
    const interval = setInterval(spawnIcon, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, spawnIcon]);

  // Collision detection
  useEffect(() => {
    if (!gameStarted) return;

    icons.forEach((icon) => {
      if (checkCollision(icon)) {
        if (icon.type === "drama") {
          setDramaCollected((prev) => prev + 1);
          updateXP(XP_PER_DRAMA_ICON, false);
          addFloatingText("+1 Drama (+10 XP)", true);
          addXP(10); // Award XP for drama
        } else {
          setSilenceCollected((prev) => prev + 1);
          updateXP(5, false);
          addFloatingText("Silence (+5 XP)", true);
          addXP(5); // Award XP for silence
        }
        setIcons((prev) => prev.filter((i) => i.id !== icon.id));
      }
    });
  }, [playerPos, icons, checkCollision, gameStarted, addXP, updateXP, addFloatingText]);

  // Check for immediate fail
  useEffect(() => {
    if (dramaCollected > MAX_DRAMA && !failed) {
      setFailed("DRAMA HURRICANE! The storm consumed you!");
    }
  }, [dramaCollected, failed]);

  if (!gameStarted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 overflow-hidden">
        {/* Storm Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Lightning flicker */}
          <motion.div
            animate={{ 
              opacity: [0, 0.03, 0, 0.05, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2,
              times: [0, 0.1, 0.2, 0.3, 0.4]
            }}
            className="absolute inset-0 bg-gradient-to-br from-crimson/10 to-purple-500/10"
          />
          
          {/* Particle wind effect - only render on client */}
          {isMounted && particles.current.map((particle, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, particle.endX],
                y: [particle.startY, particle.endY],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-crimson/20 rounded-full"
              style={{
                left: `${particle.startX}%`,
                top: `${particle.startY}%`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10"
        >
          {/* Lightning flicker behind card */}
          <motion.div
            animate={{ 
              opacity: [0, 0.08, 0, 0.12, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1.5,
              times: [0, 0.15, 0.25, 0.35, 0.5]
            }}
            className="absolute -inset-4 bg-gradient-to-br from-crimson/20 via-pink-glow/20 to-purple-500/20 rounded-3xl blur-2xl -z-10"
          />

          <div className="bg-card/50 backdrop-blur-sm border border-crimson/20 rounded-2xl p-8 shadow-2xl relative">
            <span className="text-crimson text-sm font-bold tracking-widest">
              LEVEL 6
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">
              NATAK HURRICANE ARC
            </h1>
            <p className="text-muted mb-4 leading-relaxed">
              Control the shinobi and collect drama icons!
              <br />
              <span className="text-pink-glow font-semibold">
                But not too much, and not too little!
              </span>
            </p>

            {/* Visual Balance Preview */}
            <div className="bg-background/40 rounded-xl p-4 mb-4 border border-crimson/10">
              <p className="text-xs text-muted mb-3 uppercase tracking-wide">Balance Concept</p>
              <div className="relative h-8 bg-card rounded-full overflow-hidden border border-crimson/20">
                {/* Danger zones */}
                <div className="absolute inset-y-0 left-0 w-[53%] bg-error/10" />
                <div className="absolute inset-y-0 right-0 bg-error/10" />
                {/* Sweet spot with glow */}
                <div 
                  className="absolute inset-y-0 bg-gold/20"
                  style={{ 
                    left: '53%',
                    width: '47%'
                  }}
                >
                  {/* Gold glow pulse */}
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gold/30"
                  />
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ 
                      x: ['-100%', '200%'],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ width: '30%' }}
                  />
                </div>
                {/* Sweep animation on load */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/40 to-transparent"
                  style={{ width: '30%' }}
                />
                {/* Labels */}
                <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold">
                  <span className="text-error">Too Little</span>
                  <span className="text-gold">Perfect</span>
                  <motion.span 
                    animate={{ 
                      color: ['rgb(239, 68, 68)', 'rgb(220, 38, 38)', 'rgb(239, 68, 68)'],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-error"
                  >
                    Overload
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="bg-background/30 rounded-xl p-4 mb-6 text-sm space-y-3">
              {/* Standardized Icon Row 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-10 h-10 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                  }}
                >
                  <motion.div
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full bg-gold/20"
                  />
                  <GameIcon type="sparkle" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <span className="font-medium text-gold flex-1 text-left">Keep your drama between 8–15 to survive the storm</span>
                {/* Spark particle */}
                <motion.div
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="w-1 h-1 bg-gold rounded-full"
                />
              </motion.div>
              
              {/* Standardized Icon Row 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-10 h-10 rounded-full bg-crimson/10 border-2 border-crimson/30 flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(220, 20, 60, 0.2)'
                  }}
                >
                  <motion.div
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full bg-crimson/20"
                  />
                  <GameIcon type="drama" variant="avoid" size="sm" showBadge={false} />
                </motion.div>
                <span className="text-crimson flex-1 text-left">Too much chaos = Overload</span>
              </motion.div>
              
              {/* Standardized Icon Row 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-10 h-10 rounded-full bg-muted/10 border-2 border-muted/30 flex items-center justify-center shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(100, 116, 139, 0.2)'
                  }}
                >
                  <motion.div
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full bg-muted/20"
                  />
                  <GameIcon type="mute" variant="neutral" size="sm" showBadge={false} />
                </motion.div>
                <span className="text-muted flex-1 text-left">Too little drama = No spark</span>
              </motion.div>
            </div>

            <div className="text-xs text-muted/70 mb-4 italic">
              <p>Desktop: Click/Drag or Arrow keys/WASD</p>
              <p>Mobile: Tap or Drag to move</p>
            </div>

            <motion.button
              onClick={() => setGameStarted(true)}
              whileHover={{ 
                x: [0, -3, 3, -3, 3, 0],
              }}
              transition={{
                x: { duration: 0.2, ease: "easeInOut" },
              }}
              className="relative px-10 py-4 bg-crimson text-white font-bold text-lg rounded-xl transition-all overflow-hidden group"
            >
              {/* Background gradient animation */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-crimson via-pink-glow to-crimson opacity-50"
              />
              <span className="relative z-10">ENTER THE STORM</span>
              
              {/* Soft red glow pulse */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-crimson/40 blur-xl -z-10 rounded-xl"
              />
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative z-10">
      {/* Red flash overlay */}
      <AnimatePresence>
        {showRedFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-error pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Dim effect overlay */}
      <AnimatePresence>
        {showDimEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="flex justify-between w-full max-w-md mb-4">
        <div className="text-center">
          <p className="text-xs text-muted">DRAMA</p>
          <p className={`text-2xl font-bold ${dramaCollected >= REQUIRED_DRAMA ? "text-gold" : "text-crimson"}`}>
            {dramaCollected}/{REQUIRED_DRAMA}-{MAX_DRAMA}
          </p>
        </div>
        <div className="text-center relative">
          <p className="text-xs text-muted">XP GAINED</p>
          <motion.p 
            key={xpGained}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold relative ${multiplier > 1 ? 'text-gold' : 'text-foreground'}`}
          >
            {xpGained}
            {/* Golden aura when XP is high */}
            {xpGained >= 800 && (
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 -z-10 blur-lg bg-gold/40 rounded-full"
              />
            )}
          </motion.p>
          {multiplier > 1 && (
            <motion.p 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs text-gold"
            >
              ×{multiplier}
            </motion.p>
          )}
          {xpGained >= 800 && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[9px] text-gold/80 font-medium mt-0.5"
            >
              Max Power!
            </motion.p>
          )}
        </div>
        <div className={`text-center ${timeLeft <= 10 ? "text-error" : ""}`}>
          <p className="text-xs text-muted">TIME</p>
          <p className="text-2xl font-bold">{timeLeft}s</p>
        </div>
      </div>

      {/* Balance State Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={balanceState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mb-3"
        >
          {balanceState === "too-calm" && (
            <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ❄️
              </motion.div>
              <span>Too Calm...</span>
            </div>
          )}
          {balanceState === "perfect" && (
            <div className="flex items-center justify-center gap-2 text-gold text-sm font-medium">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <span>Perfect Balance</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -180, -360],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </div>
          )}
          {balanceState === "overload" && (
            <div className="flex items-center justify-center gap-2 text-error text-sm font-bold">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⚠️
              </motion.div>
              <span>Overload Warning</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
              >
                ⚠️
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Game Arena */}
      <motion.div
        ref={arenaRef}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          filter: balanceState === "too-calm" ? "hue-rotate(20deg) saturate(0.8)" : "none"
        }}
        className={`relative bg-card/30 rounded-2xl border-2 overflow-hidden cursor-pointer select-none transition-all duration-300 ${
          balanceState === "perfect" ? 'border-gold/60' :
          balanceState === "overload" ? 'border-crimson/60' : 
          'border-crimson/30'
        }`}
        style={{ 
          width: ARENA_SIZE, 
          height: ARENA_SIZE, 
          maxWidth: "90vw", 
          maxHeight: "90vw",
          boxShadow: balanceState === "perfect" 
            ? '0 0 30px rgba(255, 215, 0, 0.3)' 
            : balanceState === "overload"
            ? '0 0 30px rgba(220, 20, 60, 0.4)' 
            : '0 0 10px rgba(100, 116, 139, 0.2)'
        }}
        // Touch events for mobile
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // Mouse events for desktop drag
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        // Click to move
        onClick={handleArenaClick}
      >
        {/* Red pulse when overload */}
        {balanceState === "overload" && (
          <motion.div
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-4 border-crimson/50 rounded-2xl pointer-events-none"
          />
        )}

        {/* Gold glow when perfect */}
        {balanceState === "perfect" && (
          <motion.div
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-4 border-gold/40 rounded-2xl pointer-events-none"
          />
        )}

        {/* Lightning flicker inside grid */}
        {isMounted && (
          <motion.div
            animate={{ 
              opacity: [0, 0.05, 0, 0.08, 0],
            }}
            transition={{ 
              duration: 0.4,
              repeat: Infinity,
              repeatDelay: Math.random() * 2 + 6,
              times: [0, 0.2, 0.3, 0.5, 1]
            }}
            className="absolute inset-0 bg-gradient-radial from-crimson/30 via-transparent to-transparent pointer-events-none"
          />
        )}

        {/* Storm particles inside grid */}
        {isMounted && [...Array(8)].map((_, i) => {
          const particleX = (i * 15 + 10) % 100;
          const particleY = (i * 23 + 15) % 100;
          return (
            <motion.div
              key={`grid-particle-${i}`}
              animate={{
                x: [0, (i % 2 ? 20 : -20)],
                y: [0, (i % 3 ? 30 : -30)],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4
              }}
              className="absolute w-1.5 h-1.5 bg-crimson/30 rounded-full pointer-events-none"
              style={{
                left: `${particleX}%`,
                top: `${particleY}%`,
              }}
            />
          );
        })}

        {/* Grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(to right, #DC143C 1px, transparent 1px), linear-gradient(to bottom, #DC143C 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }}
        />

        {/* Player */}
        <motion.div
          animate={{ x: playerPos.x - 20, y: playerPos.y - 20 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute w-12 h-12 flex items-center justify-center z-10"
        >
          <GameIcon type="ninja" variant="neutral" size="md" />
        </motion.div>

        {/* Icons */}
        <AnimatePresence>
          {icons.map((icon) => {
            const isNearOverload = dramaCollected > 13 && icon.type === "drama";
            
            return (
              <motion.div
                key={icon.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: isNearOverload ? [0, -1, 1, -1, 1, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  x: { duration: 0.3, repeat: isNearOverload ? Infinity : 0 }
                }}
                className={`
                  absolute w-12 h-12 rounded-full flex items-center justify-center
                  ${icon.type === "drama" ? "bg-crimson/20" : "bg-blue-500/10"}
                `}
                style={{ left: icon.x - 24, top: icon.y - 24 }}
              >
                {/* Drama icon aura */}
                {icon.type === "drama" && (
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-crimson/30 rounded-full blur-md -z-10"
                  />
                )}
                
                {/* Silence icon glow */}
                {icon.type === "silence" && (
                  <>
                    <motion.div
                      animate={{ 
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-blue-400/30 rounded-full blur-md -z-10"
                    />
                    {/* Sparkle effect */}
                    <motion.div
                      animate={{ 
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-0 right-0 w-2 h-2 text-blue-300"
                      style={{ fontSize: '8px' }}
                    >
                      ✨
                    </motion.div>
                  </>
                )}
                
                <GameIcon 
                  type={icon.iconType} 
                  variant={icon.type === "drama" ? "tap" : "avoid"} 
                  size="sm" 
                  showBadge={false}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Floating Text */}
        <AnimatePresence>
          {floatingTexts.map((text) => (
            <motion.div
              key={text.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -60, 
                scale: [0.8, 1.2, 1.1, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, times: [0, 0.15, 0.6, 1] }}
              className={`absolute font-bold text-base pointer-events-none z-30 whitespace-nowrap ${
                text.isPositive ? 'text-gold' : 'text-blue-300'
              }`}
              style={{ 
                left: text.x - 50, 
                top: text.y - 30,
                textShadow: text.isPositive 
                  ? '0 2px 8px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)' 
                  : '0 2px 8px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              {text.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Progress Bars */}
      <div className="w-full max-w-md mt-4 space-y-3">
        {/* Drama Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-crimson font-semibold">Drama Balance</span>
            <span className="text-muted">{dramaCollected}/{MAX_DRAMA}</span>
          </div>
          <div className="w-full h-4 bg-card rounded-full overflow-hidden relative border border-crimson/30">
            {/* Target zone indicator */}
            <div 
              className="absolute h-full bg-gold/20"
              style={{ 
                left: `${(REQUIRED_DRAMA / MAX_DRAMA) * 100}%`,
                right: 0
              }}
            />
            <motion.div
              className={`h-full ${dramaCollected > MAX_DRAMA ? "bg-error" : "bg-crimson"}`}
              animate={{ width: `${Math.min((dramaCollected / MAX_DRAMA) * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Silence Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted font-semibold">Silence Collected</span>
            <span className="text-muted">{silenceCollected}/10</span>
          </div>
          <div className="w-full h-4 bg-card rounded-full overflow-hidden relative border border-muted/30">
            <motion.div
              className="h-full bg-muted/60"
              animate={{ width: `${Math.min((silenceCollected / 10) * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Failed State */}
      {failed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/90 flex items-center justify-center z-50"
        >
          <div className="text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <GameIcon type="storm" variant="avoid" size="lg" animated />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-error mb-2 mt-6"
            >
              {failed.includes("spark") ? "No Spark – Too Calm" : 
               failed.includes("OVERLOAD") || failed.includes("HURRICANE") ? "Overload – Too Much Drama" : 
               failed}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted text-sm mb-6"
            >
              {failed.includes("spark") ? "Balance requires energy" : "Balance requires control"}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => {
                setFailed(null);
                setGameStarted(false);
                setDramaCollected(0);
                setSilenceCollected(0);
                setTimeLeft(GAME_DURATION);
                setIcons([]);
                setPlayerPos({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });
                setXpGained(0);
                setFloatingTexts([]);
                setMultiplier(1);
                lastDramaRef.current = 0;
                lastSecondTickRef.current = 0;
              }}
              className="px-8 py-3 bg-crimson text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              TRY AGAIN
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Level Complete */}
      {isComplete && (
        <>
          {/* Victory Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-gradient-to-br from-gold/20 via-background/95 to-emerald-500/20 backdrop-blur-md flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-40"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ 
                  delay: 0.5,
                  duration: 0.8,
                  ease: "backOut"
                }}
                className="text-6xl mb-4"
              >
                ⚡
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-bold text-gold mb-2"
              >
                Balance Achieved
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-muted text-lg"
              >
                The storm clears...
              </motion.p>
            </motion.div>
          </motion.div>

          <LevelComplete
            level={6}
            xpEarned={xpGained}
            clue="Silence is his strength. Chaos is his comfort."
            nextRoute="/level-7"
          />
        </>
      )}
    </main>
  );
}
