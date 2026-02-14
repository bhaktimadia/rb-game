"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBackgroundMusic } from "@/hooks/useSound";

const textSequence = [
  { text: "I know you would have said yes...", delay: 0, style: "italic" },
  { text: "But this is super cliché.", delay: 2.5, style: "default" },
  { text: "And you definitely saw this coming.", delay: 5, style: "default" },
  { text: "", delay: 7.5, isPause: true },
  { text: "But we are not a cliché couple.", delay: 9, style: "bold" },
  { text: "And you are definitely not a cliché person.", delay: 11.5, style: "bold" },
  { text: "", delay: 14, isPause: true },
  { text: "So let's do this...", delay: 15.5, style: "cinematic" },
  { text: "In our style.", delay: 17.5, style: "cinematic" },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default function MetaPage() {
  const router = useRouter();
  const { playMusic } = useBackgroundMusic();
  const [visibleTextIndices, setVisibleTextIndices] = useState<number[]>([]);
  const [bgProgress, setBgProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [showChakra, setShowChakra] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Continue romantic music
  useEffect(() => {
    playMusic("romantic");
  }, [playMusic]);

  // Initialize particles
  useEffect(() => {
    const colors = ["#DC143C", "#FF69B4", "#FFD700", "#FF1493"];
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  // Progress through text sequence with stagger
  useEffect(() => {
    textSequence.forEach((item, index) => {
      if (item.isPause) return;
      
      setTimeout(() => {
        setVisibleTextIndices(prev => [...prev, index]);
      }, item.delay * 1000);
    });

    // Background transition timing
    const bgTimer = setInterval(() => {
      setBgProgress((prev) => Math.min(prev + 0.015, 1));
    }, 100);

    // Show chakra particles after 4 seconds
    setTimeout(() => setShowChakra(true), 4000);

    // Show button after all text
    setTimeout(() => setShowButton(true), 19500);

    return () => clearInterval(bgTimer);
  }, []);

  const handleEnterGame = () => {
    setIsTransitioning(true);
    setTimeout(() => router.push("/game"), 500);
  };

  // Interpolate colors - pink to deep navy
  const bgStyle = {
    background: `linear-gradient(135deg, 
      rgb(${Math.round(255 - bgProgress * 245)}, ${Math.round(182 - bgProgress * 172)}, ${Math.round(193 - bgProgress * 175)}) 0%, 
      rgb(${Math.round(255 - bgProgress * 243)}, ${Math.round(105 - bgProgress * 95)}, ${Math.round(180 - bgProgress * 149)}) 50%,
      rgb(${Math.round(255 - bgProgress * 245)}, ${Math.round(182 - bgProgress * 172)}, ${Math.round(193 - bgProgress * 175)}) 100%)`,
  };

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden transition-all duration-1000"
      style={bgStyle}
    >
      {/* Screen Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black"
          />
        )}
      </AnimatePresence>

      {/* Subtle Vignette */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${0.1 + bgProgress * 0.15}) 100%)`,
        }}
      />

      {/* Fading Hearts */}
      <AnimatePresence>
        {bgProgress < 0.6 && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{ 
                  opacity: Math.max(0, 0.5 - bgProgress),
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                className="absolute text-red-400 pointer-events-none z-[2]"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${15 + Math.floor(i / 4) * 30}%`,
                  fontSize: 18 + (i % 3) * 6,
                }}
              >
                ❤️
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Chakra Particles Fading In */}
      <AnimatePresence>
        {showChakra && particles.map((particle) => (
          <motion.div
            key={`chakra-${particle.id}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.5 * bgProgress, 0.3 * bgProgress],
              scale: [0.5, 1.2, 0.8],
              y: [0, -25, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full pointer-events-none z-[2]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              filter: "blur(2px)",
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Text Content */}
      <div className="text-center z-10 max-w-2xl px-4">
        {textSequence.map((item, index) => {
          if (item.isPause || !visibleTextIndices.includes(index)) return null;
          
          const getStyleClasses = () => {
            switch (item.style) {
              case "italic":
                return "text-2xl sm:text-3xl font-[family-name:var(--font-playwrite)] leading-relaxed";
              case "bold":
                return "text-2xl sm:text-3xl font-semibold font-[family-name:var(--font-playfair)] leading-relaxed tracking-wide";
              case "cinematic":
                return "text-3xl sm:text-5xl font-black tracking-[0.15em] uppercase font-[family-name:var(--font-cinzel)] leading-tight";
              default:
                return "text-xl sm:text-2xl font-[family-name:var(--font-playwrite)] leading-relaxed";
            }
          };
          
          return (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                filter: { duration: 0.6 }
              }}
              className={`
                mb-8 transition-colors duration-1000
                ${getStyleClasses()}
                ${bgProgress > 0.5 ? "text-white" : "text-gray-800"}
              `}
              style={{
                textShadow: item.style === "cinematic" 
                  ? "0 0 40px rgba(220, 20, 60, 0.6), 0 0 80px rgba(255, 215, 0, 0.4)" 
                  : bgProgress > 0.5 
                    ? "0 0 30px rgba(255,255,255,0.3)" 
                    : "none",
                lineHeight: item.style === "cinematic" ? "1.3" : "1.8",
              }}
            >
              {item.style === "cinematic" ? (
                <motion.span 
                  className="bg-gradient-to-r from-crimson via-pink-glow to-gold bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  {item.text}
                </motion.span>
              ) : (
                item.text
              )}
            </motion.p>
          );
        })}

        {/* Enter Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              className="mt-16"
            >
              <motion.button
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(220, 20, 60, 0.4), 0 0 60px rgba(220, 20, 60, 0.2)",
                    "0 0 50px rgba(220, 20, 60, 0.7), 0 0 100px rgba(255, 215, 0, 0.4)",
                    "0 0 30px rgba(220, 20, 60, 0.4), 0 0 60px rgba(220, 20, 60, 0.2)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 0 60px rgba(220, 20, 60, 0.8), 0 0 120px rgba(255, 215, 0, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnterGame}
                className="px-14 py-5 bg-gradient-to-r from-crimson via-pink-glow to-crimson text-white font-bold text-xl rounded-xl relative overflow-hidden group"
              >
                {/* Animated shimmer background */}
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
                
                {/* Gradient background animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-crimson via-gold to-crimson bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔥
                  </motion.span>
                  <span className="tracking-wide">Enter Love No Jutsu</span>
                </span>
              </motion.button>

              {/* Subtle hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 text-white/50 text-sm tracking-wider"
              >
                Your mission awaits, Rahil...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
