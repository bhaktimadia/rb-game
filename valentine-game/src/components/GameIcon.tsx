"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// All available icon types
export type IconType = 
  // Level 1 - Memory Match
  | "naruto" 
  | "driving" 
  | "arcade" 
  | "popcorn" 
  | "coke" 
  | "flower" 
  | "photos" 
  | "love" 
  | "cuddle" 
  | "movies"
  // Level 2 - Tap Game
  | "anime" 
  | "drama" 
  | "speech" 
  | "hug" 
  | "mute" 
  | "sleep" 
  | "phone" 
  | "cold"
  // Level 3 - Traits
  | "planner"
  | "thinker"
  | "adventure"
  | "nature"
  | "clothes"
  | "bathtub"
  | "together"
  // Level 5 - Hearts (puzzle variants)
  | "heart1"
  | "heart2"
  | "heart3"
  | "heart4"
  | "heart5"
  | "heart6"
  | "heart7"
  | "heart8"
  | "heart9"
  // Level 6/7
  | "storm"
  | "sparkle"
  | "treasure"
  | "chest"
  // General
  | "scroll"
  | "ninja"
  | "kunai"
  | "shuriken";

// Variant system
export type IconVariant = "neutral" | "tap" | "avoid" | "memory";

// Size system
export type IconSize = "sm" | "md" | "lg";

interface GameIconProps {
  type: IconType;
  variant?: IconVariant;
  size?: IconSize;
  animated?: boolean;
  className?: string;
  showBadge?: boolean;
  backgroundColor?: string; // Custom background color for the icon badge
}

// Individual icon file mapping - each icon has its own file
const iconFileMap: Record<IconType, string> = {
  // Level 1 - Memory Match
  naruto: "naruto.png",       // Ramen bowl
  driving: "driving.png",     // Car
  arcade: "arcade.png",       // Joystick
  popcorn: "popcorn.png",     // Popcorn
  coke: "coke.png",          // Cola
  flower: "flower.png",       // Red rose
  
  // Level 2 - Interactions
  photos: "photos.png",       // Camera
  love: "love.png",          // Heart
  cuddle: "cuddle.png",       // Couple
  movies: "movies.png",       // Clapperboard
  anime: "anime.png",        // Naruto face
  drama: "drama.png",        // Drama mask
  
  // Level 3 - Traits
  speech: "speech.png",       // Speech bubble
  hug: "hug.png",            // Hug heart
  mute: "mute.png",          // Muted speaker
  sleep: "sleep.png",        // Sleep moon
  phone: "phone.png",        // Phone
  cold: "cold.png",          // Ice potion
  
  // Level 4 - More traits
  planner: "planner.png",     // Planner book
  thinker: "thinker.png",     // Brain
  adventure: "adventure.png", // Compass/backpack
  nature: "nature.png",       // Leaf
  clothes: "clothes.png",     // Shirt
  bathtub: "bathtub.png",     // Bathtub
  
  // Level 5 - Ninja themed
  ninja: "ninja.png",         // Ninja character
  kunai: "kunai.png",         // Kunai blade
  shuriken: "shuriken.png",   // Shuriken
  scroll: "scroll.png",       // Scroll
  chest: "chest.png",         // Treasure chest
  sparkle: "sparkle.png",     // Sparkle stars
  
  // Level 6 - Special
  storm: "storm.png",         // Storm cloud
  together: "together.png",   // Couple together
  treasure: "treasure.png",   // Gem/treasure
  
  // Hearts (puzzle variants)
  heart1: "heart1.png",       // Gold frame heart
  heart2: "heart2.png",       // Pink glowing heart
  heart3: "heart3.png",       // Crystal heart
  heart4: "heart4.png",       // Winged heart
  heart5: "heart5.png",       // Arrow heart
  heart6: "heart6.png",       // Ribbon heart
  heart7: "heart7.png",       // Heart lock
  heart8: "heart8.png",       // Heart with key
  heart9: "heart9.png",       // Flaming heart
};

// Variant glow configurations
const variantConfig = {
  neutral: {
    glow: "rgba(255, 215, 0, 0.5)",
    glowMid: "rgba(255, 215, 0, 0.25)",
    glowOuter: "rgba(255, 215, 0, 0.1)",
    bgStart: "rgba(30, 30, 35, 0.95)",
    bgMid: "rgba(25, 25, 30, 0.98)",
    bgEnd: "rgba(20, 20, 25, 1)",
    border: "rgba(255, 215, 0, 0.3)",
  },
  tap: {
    glow: "rgba(34, 197, 94, 0.6)",
    glowMid: "rgba(34, 197, 94, 0.35)",
    glowOuter: "rgba(34, 197, 94, 0.15)",
    bgStart: "rgba(20, 35, 25, 0.95)",
    bgMid: "rgba(15, 30, 20, 0.98)",
    bgEnd: "rgba(10, 25, 15, 1)",
    border: "rgba(34, 197, 94, 0.4)",
  },
  avoid: {
    glow: "rgba(239, 68, 68, 0.6)",
    glowMid: "rgba(239, 68, 68, 0.35)",
    glowOuter: "rgba(239, 68, 68, 0.15)",
    bgStart: "rgba(35, 20, 20, 0.95)",
    bgMid: "rgba(30, 15, 15, 0.98)",
    bgEnd: "rgba(25, 10, 10, 1)",
    border: "rgba(239, 68, 68, 0.4)",
  },
  memory: {
    glow: "rgba(255, 215, 0, 0.35)",
    glowMid: "rgba(255, 215, 0, 0.18)",
    glowOuter: "rgba(255, 215, 0, 0.08)",
    bgStart: "rgba(28, 28, 32, 0.92)",
    bgMid: "rgba(24, 24, 28, 0.95)",
    bgEnd: "rgba(20, 20, 24, 0.98)",
    border: "rgba(255, 215, 0, 0.2)",
  },
};

// Size configurations
const sizeConfig = {
  sm: { badge: 40, icon: 28, sprite: 40 },
  md: { badge: 56, icon: 40, sprite: 56 },
  lg: { badge: 80, icon: 56, sprite: 80 },
};

export default function GameIcon({
  type,
  variant = "neutral",
  size = "md",
  animated = false,
  className = "",
  showBadge = true,
  backgroundColor,
}: GameIconProps) {
  const config = variantConfig[variant];
  const sizes = sizeConfig[size];
  const iconFile = iconFileMap[type];
  const iconUrl = `/icons/${iconFile}`;
  
  // Use custom background color if provided, otherwise use variant config
  const badgeBackground = backgroundColor || 
    `linear-gradient(165deg, ${config.bgStart} 0%, ${config.bgMid} 40%, ${config.bgEnd} 100%)`;
  
  const IconImage = (
    <div 
      className="relative overflow-hidden pointer-events-none flex items-center justify-center"
      style={{
        width: sizes.sprite,
        height: sizes.sprite,
      }}
    >
      <Image
        src={iconUrl}
        alt={type}
        width={sizes.sprite}
        height={sizes.sprite}
        className="pointer-events-none object-contain"
        style={{
          filter: variant === "avoid" 
            ? "drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))" 
            : variant === "tap"
            ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))"
            : "drop-shadow(0 0 3px rgba(255, 215, 0, 0.3))",
        }}
      />
    </div>
  );

  if (!showBadge) {
    return (
      <motion.div
        className={`inline-flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.06, rotate: 2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          width: sizes.sprite,
          height: sizes.sprite,
        }}
      >
        {IconImage}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      animate={animated ? { y: [0, -2, 0] } : undefined}
      transition={animated ? {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      } : undefined}
      whileHover={{
        y: -3,
        rotate: 2,
        scale: 1.06,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
        }
      }}
    >
      {/* Badge container with dynamic styling */}
      <div
        className="rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: sizes.badge + 20,
          height: sizes.badge + 20,
          background: badgeBackground,
          boxShadow: `
            0 0 8px ${config.glow},
            0 0 18px ${config.glowMid},
            0 0 28px ${config.glowOuter},
            inset 0 1px 2px rgba(255,255,255,0.08),
            inset 0 -1px 3px rgba(0,0,0,0.4),
            0 2px 4px rgba(0,0,0,0.3)
          `,
          border: `1.5px solid ${config.border}`,
        }}
      >
        {/* Inner highlight arc */}
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
          }}
        />
        {IconImage}
      </div>
    </motion.div>
  );
}
