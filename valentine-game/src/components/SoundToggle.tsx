"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBackgroundMusic } from "@/hooks/useSound";

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setVolume } = useBackgroundMusic();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setVolume(newMuted ? 0 : 0.5);
  };

  if (!mounted) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-card/80 backdrop-blur-sm border border-gold/30 rounded-full flex items-center justify-center text-xl hover:border-gold transition-all"
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? "🔇" : "🔊"}
    </motion.button>
  );
}
