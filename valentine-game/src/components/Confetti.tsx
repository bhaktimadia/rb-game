"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  trigger: boolean;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  rotation: number;
  delay: number;
  size: number;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ["#FFD700", "#DC143C", "#FF69B4", "#22C55E", "#FFFFFF"];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5,
          size: Math.random() * 8 + 4,
        });
      }
      
      setParticles(newParticles);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              x: `${particle.x}vw`,
              y: "-10vh",
              rotate: particle.rotation,
            }}
            animate={{
              opacity: [1, 1, 0],
              y: "110vh",
              rotate: particle.rotation + 720,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
