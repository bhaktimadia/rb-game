"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export default function ChakraParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const colors = ["#DC143C", "#FF69B4", "#FFD700"];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);
  }, []);

  // Hide on intro pages (they have their own effects)
  const hideOnPages = pathname === "/" || pathname === "/meta";

  if (hideOnPages) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full chakra-particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: `blur(${particle.size / 3}px)`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}
