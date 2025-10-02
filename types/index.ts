export interface QuizSet {
  id: string;
  name: string;
  topic?: string;
  difficulty?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type QuestionType = "mcq" | "short_answer";

export interface Question {
  id: string;
  quizSetId: string;
  type: QuestionType;
  prompt: string;
  choices?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  explanation?: string;
  tags?: string[];
  timesSeen: number;
  timesCorrect: number;
}

export interface AppAssignment {
  id: string;
  appName: string;
  quizSetId: string;
  schemeOrStoreURL?: string;
  randomize: boolean;
  requireStreak: number;
  cooldownSeconds: number;
  enabled: boolean;
}

export interface Attempt {
  id: string;
  appAssignmentId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}
