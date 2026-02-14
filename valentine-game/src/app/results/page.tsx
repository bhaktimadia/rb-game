"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Confetti from "@/components/Confetti";
import Polaroid from "@/components/Polaroid";

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "20");
  const percentage = Math.round((score / total) * 100);

  const getResultTier = () => {
    if (score === 20) {
      return {
        title: "Lifetime Premium Subscription Holder",
        emoji: "💎",
        color: "text-highlight",
      };
    } else if (score >= 16) {
      return {
        title: "Elite Partner",
        emoji: "🏆",
        color: "text-accent",
      };
    } else if (score >= 10) {
      return {
        title: "Certified Good Husband",
        emoji: "✨",
        color: "text-success",
      };
    } else {
      return {
        title: "Husband in Training",
        emoji: "📚",
        color: "text-muted",
      };
    }
  };

  const result = getResultTier();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <Confetti trigger={true} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="text-center" glow={score >= 16}>
          {/* Result Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
          >
            <span className="text-xs font-bold tracking-widest text-muted uppercase">
              Result
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
          >
            HUSBAND STATUS
          </motion.h1>

          {/* Emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {result.emoji}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xl sm:text-2xl font-bold mb-6 ${result.color}`}
          >
            {result.title}
          </motion.h2>

          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-background/50 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-accent">{score}</div>
                <div className="text-sm text-muted">Correct</div>
              </div>
              <div className="text-3xl text-muted">/</div>
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground">{total}</div>
                <div className="text-sm text-muted">Questions</div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-card"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 302" }}
                  animate={{
                    strokeDasharray: `${(percentage / 100) * 302} 302`,
                  }}
                  transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF4D6D" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">
                  {percentage}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Personal Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-card/50 border border-muted/10 rounded-xl p-5 mb-6 text-left"
          >
            <p className="text-foreground/90 leading-relaxed text-sm">
              Valentine&apos;s isn&apos;t about flowers.
              <br />
              It&apos;s about knowing each other deeply.
            </p>
            <p className="text-muted leading-relaxed text-sm mt-3">
              And after 2 years,
              <br />
              I&apos;m proud of us.
            </p>
            <p className="text-highlight font-medium text-sm mt-3">
              Still choosing.
              <br />
              Still growing.
              <br />
              Still laughing.
            </p>
          </motion.div>

          {/* Polaroid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex justify-center mb-6"
          >
            <Polaroid caption="2 years and counting" rotation={3} />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link href="/surprise">
              <button className="group relative w-full px-8 py-4 bg-accent text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,77,109,0.4)]">
                <span className="absolute inset-0 bg-gradient-to-r from-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">UNLOCK YOUR SURPRISE</span>
              </button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-muted/50 text-xs mt-6"
          >
            ♥ Happy Valentine&apos;s Day ♥
          </motion.p>
        </Card>
      </motion.div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-4">
          <Card className="text-center">
            <div className="animate-pulse">Calculating results...</div>
          </Card>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
