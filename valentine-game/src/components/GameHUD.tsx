"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { usePathname } from "next/navigation";

export default function GameHUD() {
  const { xp, scrollFragments } = useGameStore();
  const pathname = usePathname();

  // Hide HUD on intro pages
  if (pathname === "/" || pathname === "/meta" || pathname === "/game") return null;

  const xpPercentage = (xp / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-4"
    >
      {/* Scroll Fragments */}
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gold/30">
        <span className="text-lg">📜</span>
        <span className="text-sm font-bold text-gold">
          {scrollFragments}/7
        </span>
      </div>

      {/* XP Bar */}
      <div className="bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gold/30 min-w-[140px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-gold tracking-wider">XP</span>
          <span className="text-[10px] font-bold text-gold">{xp}/1000</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 0.5 }}
            style={{
              boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
