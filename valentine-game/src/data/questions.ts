export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string;
  correctFeedback?: string;
  wrongFeedback?: string;
}

export interface Round {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  description: string;
  questions: Question[];
  endPhoto?: {
    caption: string;
    rotation: number;
  };
}

export const rounds: Round[] = [
  {
    id: "round-1",
    title: "First Memories",
    description: "Test your memory of our early days together",
    questions: [
      {
        id: "q1",
        question: "Where did we first meet?",
        options: ["Coffee Shop", "Park", "Library", "Online"],
        correctAnswer: 0,
      },
      {
        id: "q2",
        question: "What was our first date?",
        options: ["Movie", "Dinner", "Concert", "Walk"],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: "round-2",
    title: "Our Adventures",
    description: "Remember the fun times we've shared",
    questions: [
      {
        id: "q3",
        question: "What's our favorite restaurant?",
        options: ["Italian", "Mexican", "Japanese", "Thai"],
        correctAnswer: 2,
      },
    ],
  },
];

export function getTotalQuestions(): number {
  return rounds.reduce((total, round) => total + round.questions.length, 0);
}

export function getQuestionByGlobalIndex(index: number): {
  question: Question;
  round: Round;
  questionInRound: number;
} | null {
  let currentIndex = 0;
  for (const round of rounds) {
    if (index < currentIndex + round.questions.length) {
      return {
        question: round.questions[index - currentIndex],
        round,
        questionInRound: index - currentIndex,
      };
    }
    currentIndex += round.questions.length;
  }
  return null;
}

export function isFirstQuestionOfRound(globalIndex: number): boolean {
  let currentIndex = 0;
  for (const round of rounds) {
    if (globalIndex === currentIndex) return true;
    currentIndex += round.questions.length;
  }
  return false;
}

export function isLastQuestionOfRound(globalIndex: number): boolean {
  let currentIndex = 0;
  for (const round of rounds) {
    currentIndex += round.questions.length;
    if (globalIndex === currentIndex - 1) return true;
  }
  return false;
}
