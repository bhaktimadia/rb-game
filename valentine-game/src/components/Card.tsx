"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
  glow = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-card rounded-2xl p-6 border border-muted/10
        ${hover ? "card-hover cursor-pointer" : ""}
        ${glow ? "pulse-glow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
