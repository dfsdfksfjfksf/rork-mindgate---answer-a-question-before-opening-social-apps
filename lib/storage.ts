import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuizSet, Question, AppAssignment, Attempt } from "@/types";

const KEYS = {
  QUIZ_SETS: "mindgate_quiz_sets",
  QUESTIONS: "mindgate_questions",
  APP_ASSIGNMENTS: "mindgate_app_assignments",
  ATTEMPTS: "mindgate_attempts",
  INITIALIZED: "mindgate_initialized",
} as const;

export const storage = {
  async getQuizSets(): Promise<QuizSet[]> {
    const data = await AsyncStorage.getItem(KEYS.QUIZ_SETS);
    return data ? JSON.parse(data) : [];
  },

  async setQuizSets(quizSets: QuizSet[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.QUIZ_SETS, JSON.stringify(quizSets));
  },

  async getQuestions(): Promise<Question[]> {
    const data = await AsyncStorage.getItem(KEYS.QUESTIONS);
    return data ? JSON.parse(data) : [];
  },

  async setQuestions(questions: Question[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  async getAppAssignments(): Promise<AppAssignment[]> {
    const data = await AsyncStorage.getItem(KEYS.APP_ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
  },

  async setAppAssignments(assignments: AppAssignment[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.APP_ASSIGNMENTS, JSON.stringify(assignments));
  },

  async getAttempts(): Promise<Attempt[]> {
    const data = await AsyncStorage.getItem(KEYS.ATTEMPTS);
    return data ? JSON.parse(data) : [];
  },

  async setAttempts(attempts: Attempt[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
  },

  async isInitialized(): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.INITIALIZED);
    return data === "true";
  },

  async setInitialized(): Promise<void> {
    await AsyncStorage.setItem(KEYS.INITIALIZED, "true");
  },
};
