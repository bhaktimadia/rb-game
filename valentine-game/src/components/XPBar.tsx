"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  label?: string;
}

export default function XPBar({ current, max, label = "XP" }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full max-w-md">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span>
            {current} / {max}
          </span>
        </div>
      )}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
