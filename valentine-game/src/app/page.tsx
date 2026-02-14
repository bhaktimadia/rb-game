"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBackgroundMusic } from "@/hooks/useSound";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function ClichePage() {
  const router = useRouter();
  const { playMusic } = useBackgroundMusic();
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [showHearts, setShowHearts] = useState(true);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [noShake, setNoShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate floating hearts and particles
  useEffect(() => {
    const newHearts = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 20 + 15,
    }));
    setHearts(newHearts);

    // Particles for tap overlay
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Handle start overlay click
  const handleStart = () => {
    playMusic("romantic");
    setMusicStarted(true);
    setShowStartOverlay(false);
  };

  const handleNoHover = () => {
    // Move button to random position
    const maxX = 200;
    const maxY = 150;
    const newX = (Math.random() - 0.5) * maxX * 2;
    const newY = (Math.random() - 0.5) * maxY * 2;
    setNoButtonPos({ x: newX, y: newY });
    
    // Trigger shake
    setNoShake(true);
    setTimeout(() => setNoShake(false), 500);
  };

  const handleYesClick = () => {
    if (!musicStarted) {
      playMusic("romantic");
    }
    
    // Start cinematic transition
    setIsTransitioning(true);
    setShowHearts(false);
    
    // Navigate after fade
    setTimeout(() => router.push("/meta"), 600);
  };

  return (
    <main 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #FFB6C1 100%)",
            "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 50%, #FF69B4 100%)",
            "linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #FFB6C1 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft Vignette */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Screen Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black"
          />
        )}
      </AnimatePresence>

      {/* Start Overlay - Tap to Begin */}
      <AnimatePresence>
        {showStartOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleStart}
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,182,193,0.97) 0%, rgba(255,105,180,0.97) 50%, rgba(255,182,193,0.97) 100%)",
            }}
          >
            {/* Floating Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white/40"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
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

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center relative"
            >
              {/* Glow bloom behind heart */}
              <motion.div
                className="absolute inset-0 -z-10 flex items-center justify-center"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div 
                  className="w-40 h-40 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                    filter: "blur(20px)",
                  }}
                />
              </motion.div>

              {/* Heart Icon with Pulse */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  filter: [
                    "drop-shadow(0 0 20px rgba(255,255,255,0.5))",
                    "drop-shadow(0 0 40px rgba(255,255,255,0.8))",
                    "drop-shadow(0 0 20px rgba(255,255,255,0.5))",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl mb-8"
              >
                💝
              </motion.div>

              {/* Text with delayed fade-in */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white text-2xl font-semibold drop-shadow-lg mb-3 tracking-wide"
              >
                Tap anywhere to begin
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-white/70 text-sm tracking-wider"
              >
                ♪ with music ♪
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts */}
      <AnimatePresence>
        {showHearts && hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              y: [0, -40, 0],
              x: [0, 15, 0],
              rotate: [0, 10, -10, 0],
            }}
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            transition={{
              duration: 4,
              delay: heart.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute text-red-400 pointer-events-none select-none z-[2]"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: heart.size,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isTransitioning ? 0 : 1, scale: isTransitioning ? 0.9 : 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center z-10 relative"
      >
        {/* Decorative hearts */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          💕
        </motion.div>

        {/* Main Question with Radial Glow */}
        <div className="relative">
          {/* Radial glow behind headline */}
          <div 
            className="absolute inset-0 -z-10 flex items-center justify-center"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 60%)",
              filter: "blur(30px)",
              transform: "scale(1.5)",
            }}
          />
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-wide px-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Will you be my
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-red-600 mb-12 drop-shadow-lg px-4"
            style={{ 
              fontFamily: "'Poppins', sans-serif",
              textShadow: "2px 2px 10px rgba(255,255,255,0.5), 0 0 40px rgba(220,20,60,0.3)",
              letterSpacing: "0.02em",
            }}
          >
            Valentine? 💝
          </motion.h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center relative min-h-24 px-4">
          {/* YES Button with Pulse */}
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              boxShadow: [
                "0 4px 20px rgba(239, 68, 68, 0.4)",
                "0 4px 35px rgba(239, 68, 68, 0.7)",
                "0 4px 20px rgba(239, 68, 68, 0.4)",
              ],
            }}
            transition={{ 
              delay: 0.8,
              boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0 6px 40px rgba(239, 68, 68, 0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleYesClick}
            className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-full shadow-lg transition-colors relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <span className="relative z-10">YES ❤️</span>
          </motion.button>

          {/* NO Button - Runs Away */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: 1, 
              x: noButtonPos.x,
              y: noButtonPos.y,
              rotate: noShake ? [0, -5, 5, -5, 5, 0] : 0,
            }}
            transition={{ 
              delay: 0.8,
              x: { type: "spring", stiffness: 300, damping: 20 },
              y: { type: "spring", stiffness: 300, damping: 20 },
              rotate: { duration: 0.5 },
            }}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            className="px-10 py-4 bg-gray-400 hover:bg-gray-500 text-white font-bold text-xl rounded-full shadow-lg transition-colors"
          >
            NO 😈
          </motion.button>
        </div>

        {/* Playful hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-white/70 text-sm"
        >
          (Try clicking NO... if you can 😏)
        </motion.p>
      </motion.div>

      {/* Corner hearts decoration */}
      <motion.div 
        className="absolute top-4 left-4 text-4xl opacity-40 z-[2]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        💗
      </motion.div>
      <motion.div 
        className="absolute top-4 right-4 text-4xl opacity-40 z-[2]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        💗
      </motion.div>
      <motion.div 
        className="absolute bottom-4 left-4 text-4xl opacity-40 z-[2]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        💗
      </motion.div>
      <motion.div 
        className="absolute bottom-4 right-4 text-4xl opacity-40 z-[2]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        💗
      </motion.div>
    </main>
  );
}
