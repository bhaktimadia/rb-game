"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import LevelComplete from "@/components/LevelComplete";
import { useBackgroundMusic } from "@/hooks/useSound";
import GameIcon, { IconType } from "@/components/GameIcon";

interface Trait {
  id: number;
  name: string;
  iconType: IconType;
  correctPerson: "him" | "her" | "both";
  matched: boolean;
}

const traits: Trait[] = [
  // HIM traits
  { id: 1, name: "Trip Planner", iconType: "planner", correctPerson: "him", matched: false },
  { id: 2, name: "Adventure With Comfort", iconType: "adventure", correctPerson: "him", matched: false },
  { id: 3, name: "Closet Commander", iconType: "clothes", correctPerson: "him", matched: false },
  { id: 4, name: "Logic Over Drama", iconType: "thinker", correctPerson: "him", matched: false },
  { id: 5, name: "Pretends Not To Care", iconType: "cold", correctPerson: "him", matched: false },
  
  // Additional HIM traits
  { id: 6, name: "Last Minute Planner", iconType: "planner", correctPerson: "him", matched: false },
  { id: 7, name: "Anime Mode", iconType: "anime", correctPerson: "him", matched: false },
  { id: 8, name: "Sleep Overachiever", iconType: "sleep", correctPerson: "him", matched: false },
  
  // HER traits
  { id: 9, name: "Overthinker", iconType: "thinker", correctPerson: "her", matched: false },
  { id: 10, name: "Nature Soul", iconType: "nature", correctPerson: "her", matched: false },
  { id: 11, name: "Drama Magnet", iconType: "drama", correctPerson: "her", matched: false },
  { id: 12, name: "Hopeless Romantic", iconType: "love", correctPerson: "her", matched: false },
  { id: 13, name: "Gets Emotional in Movies", iconType: "movies", correctPerson: "her", matched: false },
  
  // BOTH traits
  { id: 14, name: "Bathtub Hunt", iconType: "bathtub", correctPerson: "both", matched: false },
  { id: 15, name: "Calm + Chaos Combo", iconType: "storm", correctPerson: "both", matched: false },
  { id: 16, name: "Us Against The World", iconType: "together", correctPerson: "both", matched: false },
  { id: 17, name: "Silent Understanding", iconType: "ninja", correctPerson: "both", matched: false },
  { id: 18, name: "Fight → Fix → Repeat", iconType: "hug", correctPerson: "both", matched: false },
  { id: 19, name: "Emotional Ninja", iconType: "cuddle", correctPerson: "both", matched: false },
];

export default function Level3() {
  const { addXP } = useGameStore();
  const { playMusic } = useBackgroundMusic();
  const [traitList, setTraitList] = useState(traits);
  const [draggedTrait, setDraggedTrait] = useState<Trait | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showXP, setShowXP] = useState<{ correct: boolean } | null>(null);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  // Play game music
  useEffect(() => {
    playMusic("game");
  }, [playMusic]);

  const handleDragStart = (trait: Trait) => {
    if (trait.matched) return;
    setDraggedTrait(trait);
  };

  const handleDragEnd = () => {
    setDraggedTrait(null);
    setHoveredZone(null);
  };

  const handleDrop = (zone: "him" | "her" | "both") => {
    if (!draggedTrait) return;

    if (draggedTrait.correctPerson === zone) {
      // Correct match!
      setTraitList((prev) =>
        prev.map((t) =>
          t.id === draggedTrait.id ? { ...t, matched: true } : t
        )
      );
      addXP(15);
      setTotalXPEarned((prev) => prev + 15);
      setShowXP({ correct: true });
      setTimeout(() => setShowXP(null), 800);
      setMatchedCount((prev) => {
        const newCount = prev + 1;
        if (newCount === traits.length) {
          setTimeout(() => setIsComplete(true), 500);
        }
        return newCount;
      });
    } else {
      // Wrong - shake animation and deduct XP
      setShake(zone);
      addXP(-10);
      setTotalXPEarned((prev) => prev - 10);
      setShowXP({ correct: false });
      setTimeout(() => {
        setShake(null);
        setShowXP(null);
      }, 800);
    }

    setDraggedTrait(null);
    setHoveredZone(null);
  };

  const handleTouchMove = (e: React.TouchEvent, trait: Trait) => {
    if (trait.matched) return;
    setDraggedTrait(trait);
    
    // Get touch position and check which zone it's over
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    const himZone = elements.find(el => el.id === "zone-him");
    const herZone = elements.find(el => el.id === "zone-her");
    const bothZone = elements.find(el => el.id === "zone-both");
    
    if (himZone) setHoveredZone("him");
    else if (herZone) setHoveredZone("her");
    else if (bothZone) setHoveredZone("both");
    else setHoveredZone(null);
  };

  const handleTouchEnd = () => {
    if (draggedTrait && hoveredZone) {
      handleDrop(hoveredZone as "him" | "her" | "both");
    }
    setDraggedTrait(null);
    setHoveredZone(null);
  };

  const unmatched = traitList.filter((t) => !t.matched);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 mt-8"
      >
        <span className="text-crimson text-sm font-bold tracking-widest">
          LEVEL 3
        </span>
        <h1 className="text-3xl font-bold text-foreground mt-2">
          GRAND LINE ADVENTURE
        </h1>
        <p className="text-muted text-sm mt-1">Drag traits to the correct person</p>
      </motion.div>

      {/* Progress */}
      <div className="mb-6 text-center">
        <span className="text-gold font-bold">{matchedCount}/{traits.length}</span>
        <span className="text-muted text-sm ml-2">matched</span>
      </div>

      {/* Drop Zones */}
      <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-md">
        {/* Him Zone */}
        <motion.div
          id="zone-him"
          onDragOver={(e) => { e.preventDefault(); setHoveredZone("him"); }}
          onDragLeave={() => setHoveredZone(null)}
          onDrop={() => handleDrop("him")}
          animate={shake === "him" ? { x: [-5, 5, -5, 5, 0] } : {}}
          className={`
            p-4 rounded-xl border-2 border-dashed text-center transition-all min-h-[120px] flex flex-col items-center
            ${hoveredZone === "him" ? "border-gold bg-gold/10" : "border-muted/30 bg-card/30"}
            ${shake === "him" ? "border-error bg-error/10" : ""}
          `}
        >
          <GameIcon type="ninja" variant="neutral" size="md" />
          <p className="text-sm font-bold text-foreground mt-2">HIM</p>
          <p className="text-xs text-muted">Silent Shinobi</p>
        </motion.div>

        {/* Both Zone */}
        <motion.div
          id="zone-both"
          onDragOver={(e) => { e.preventDefault(); setHoveredZone("both"); }}
          onDragLeave={() => setHoveredZone(null)}
          onDrop={() => handleDrop("both")}
          animate={shake === "both" ? { x: [-5, 5, -5, 5, 0] } : {}}
          className={`
            p-4 rounded-xl border-2 border-dashed text-center transition-all min-h-[120px] flex flex-col items-center
            ${hoveredZone === "both" ? "border-gold bg-gold/10" : "border-muted/30 bg-card/30"}
            ${shake === "both" ? "border-error bg-error/10" : ""}
          `}
        >
          <GameIcon type="together" variant="neutral" size="md" />
          <p className="text-sm font-bold text-foreground mt-2">BOTH</p>
          <p className="text-xs text-muted">Together</p>
        </motion.div>

        {/* Her Zone */}
        <motion.div
          id="zone-her"
          onDragOver={(e) => { e.preventDefault(); setHoveredZone("her"); }}
          onDragLeave={() => setHoveredZone(null)}
          onDrop={() => handleDrop("her")}
          animate={shake === "her" ? { x: [-5, 5, -5, 5, 0] } : {}}
          className={`
            p-4 rounded-xl border-2 border-dashed text-center transition-all min-h-[120px] flex flex-col items-center
            ${hoveredZone === "her" ? "border-gold bg-gold/10" : "border-muted/30 bg-card/30"}
            ${shake === "her" ? "border-error bg-error/10" : ""}
          `}
        >
          <GameIcon type="flower" variant="neutral" size="md" />
          <p className="text-sm font-bold text-foreground mt-2">HER</p>
          <p className="text-xs text-muted">Drama Storm</p>
        </motion.div>
      </div>

      {/* XP Feedback Popup */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`fixed top-1/3 left-1/2 -translate-x-1/2 text-2xl font-bold pointer-events-none z-50 ${
              showXP.correct ? "text-emerald-400" : "text-red-400"
            }`}
            style={{
              textShadow: showXP.correct
                ? "0 0 20px rgba(34,197,94,0.8)"
                : "0 0 20px rgba(239,68,68,0.8)",
            }}
          >
            {showXP.correct ? "+15 XP ✓" : "-10 XP ✗"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trait Cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        <AnimatePresence>
          {unmatched.map((trait) => (
            <motion.div
              key={trait.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              draggable
              onDragStart={() => handleDragStart(trait)}
              onDragEnd={handleDragEnd}
              onTouchMove={(e) => handleTouchMove(e, trait)}
              onTouchEnd={handleTouchEnd}
              className={`
                bg-card border-2 border-crimson/30 rounded-xl p-4 text-center cursor-grab active:cursor-grabbing
                hover:border-crimson hover:bg-crimson/5 transition-all flex flex-col items-center
                ${draggedTrait?.id === trait.id ? "opacity-50" : ""}
              `}
            >
              <GameIcon type={trait.iconType} variant="neutral" size="md" />
              <p className="text-sm font-medium text-foreground mt-2">{trait.name}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Matched Display */}
      {matchedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted mb-2">Matched:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {traitList.filter(t => t.matched).map((trait) => (
              <div
                key={trait.id}
                className="bg-gold/20 rounded-full w-12 h-12 flex items-center justify-center"
              >
                <GameIcon type={trait.iconType} variant="memory" size="sm" showBadge={false} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Level Complete */}
      {isComplete && (
        <LevelComplete
          level={3}
          xpEarned={totalXPEarned}
          clue="The treasure hides where water meets calm."
          nextRoute="/level-4"
        />
      )}
    </main>
  );
}
