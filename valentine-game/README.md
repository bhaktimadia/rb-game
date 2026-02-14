# LOVE NO JUTSU 🥷💕

**Silent Shinobi × Drama Storm**

An anime-themed interactive treasure hunt where a calm shinobi must collect 7 scroll fragments to unlock the "Forever Co-Op Scroll."

## Game Flow (10-12 minutes)

```
Landing Page → 7 Levels → Word Trail → Treasure Chest → Romantic Reveal
```

| Level | Name | Type | XP |
|-------|------|------|-----|
| 1 | Origin Arc | MCQ + Reveal | 120 |
| 2 | Silent Shinobi Test | Rapid Fire (10s timer) | 150 |
| 3 | Grand Line Adventure | Match the Energy | 150 |
| 4 | Anime Distraction Mode | Scenario Choice | 150 |
| 5 | Love Mode | Click to Reveal | 150 |
| 6 | Natak Hurricane Arc | System Simulation | 150 |
| 7 | Chakra Word Grid | Word Search Puzzle | 80+ |
| - | Treasure | Final Reveal | - |

**Total: 1000 XP**

## Features

### Visual Design
- Dark ninja aesthetic with deep navy background
- Subtle floating chakra particles (crimson, pink, gold)
- Custom shuriken cursor (glowing pink kunai on hover)
- Gold XP progress bar visible throughout

### Game Mechanics
- 7 Scroll Fragment collection system
- Memory clues revealed after each level
- Word trail puzzle combining all memories
- Treasure chest unlock animation
- Confetti celebration on completion

### Animations
- Typing intro animation on landing
- Card flip and reveal effects
- Terminal-style system simulation (Level 6)
- Scroll assembly before final puzzle
- Energy beam on treasure unlock

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Canvas Confetti
- localStorage for progress

## Getting Started

```bash
cd valentine-game
npm install
npm run dev
```

Visit **http://localhost:3000**

## Customization

### Level 1 - Origin Arc
Edit `src/app/level-1/page.tsx`:
- Update questions and answers

### Level 2 - Rapid Fire
Edit `src/app/level-2/page.tsx`:
- Update `questions` array with personalized Q&As

### Level 3 - Grand Line
Edit `src/app/level-3/page.tsx`:
- Update `pairs` array with traits

### Level 4 - Anime Distraction
Edit `src/app/level-4/page.tsx`:
- Update `scenarios` array

### Level 5 - Love Mode
Edit `src/app/level-5/page.tsx`:
- Update `questions` array with reveal answers

### Level 6 - Natak Hurricane
Edit `src/app/level-6/page.tsx`:
- Update `scenarios` array

### Level 7 - Word Grid
Edit `src/app/level-7/page.tsx`:
- Update `WORDS_TO_FIND`, `GRID`, and `WORD_POSITIONS`

### Treasure Page
Edit `src/app/treasure/page.tsx`:
- Fill in the surprise location (replace `________`)

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a12` | Deep navy |
| Card | `#1a1a2e` | Card backgrounds |
| Crimson | `#DC143C` | Primary accent |
| Pink Glow | `#FF69B4` | Romantic accent |
| Gold | `#FFD700` | Treasure/XP |
| Muted | `#6B7280` | Secondary text |

## Deployment

```bash
npm run build
npx vercel
```

## Send to Rahil

> "Private Valentine Access. Complete the mission." 🥷

---

Made with ♥ | Love No Jutsu 2026
