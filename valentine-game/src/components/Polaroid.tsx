"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PolaroidProps {
  children?: ReactNode;
  caption?: string;
  rotation?: number;
}

export default function Polaroid({
  children,
  caption,
  rotation = 0,
}: PolaroidProps) {
  return (
    <motion.div
      className="bg-white p-4 pb-16 shadow-xl relative"
      style={{ rotate: `${rotation}deg` }}
      whileHover={{ scale: 1.05, rotate: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
        {children}
      </div>
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 text-center font-handwriting text-lg">
          {caption}
        </div>
      )}
    </motion.div>
  );
}
