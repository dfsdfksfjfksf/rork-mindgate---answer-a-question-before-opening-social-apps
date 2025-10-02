import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuizSet, Question, AppAssignment, Attempt } from "@/types";

const KEYS = {
  QUIZ_SETS: "mindgate_quiz_sets",
  QUESTIONS: "mindgate_questions",
  APP_ASSIGNMENTS: "mindgate_app_assignments",
  ATTEMPTS: "mindgate_attempts",
  INITIALIZED: "mindgate_initialized",
} as const;

// Cache to prevent unnecessary storage reads
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

const getCachedOrFetch = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const timestamp = cacheTimestamps.get(key);
  
  if (cache.has(key) && timestamp && (now - timestamp) < CACHE_TTL) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  cacheTimestamps.set(key, now);
  return data;
};

const invalidateCache = (key: string) => {
  cache.delete(key);
  cacheTimestamps.delete(key);
};

export const storage = {
  async getQuizSets(): Promise<QuizSet[]> {
    return getCachedOrFetch(KEYS.QUIZ_SETS, async () => {
      const data = await AsyncStorage.getItem(KEYS.QUIZ_SETS);
      return data ? JSON.parse(data) : [];
    });
  },

  async setQuizSets(quizSets: QuizSet[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.QUIZ_SETS, JSON.stringify(quizSets));
    invalidateCache(KEYS.QUIZ_SETS);
  },

  async getQuestions(): Promise<Question[]> {
    return getCachedOrFetch(KEYS.QUESTIONS, async () => {
      const data = await AsyncStorage.getItem(KEYS.QUESTIONS);
      return data ? JSON.parse(data) : [];
    });
  },

  async setQuestions(questions: Question[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
    invalidateCache(KEYS.QUESTIONS);
  },

  async getAppAssignments(): Promise<AppAssignment[]> {
    return getCachedOrFetch(KEYS.APP_ASSIGNMENTS, async () => {
      const data = await AsyncStorage.getItem(KEYS.APP_ASSIGNMENTS);
      return data ? JSON.parse(data) : [];
    });
  },

  async setAppAssignments(assignments: AppAssignment[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.APP_ASSIGNMENTS, JSON.stringify(assignments));
    invalidateCache(KEYS.APP_ASSIGNMENTS);
  },

  async getAttempts(): Promise<Attempt[]> {
    return getCachedOrFetch(KEYS.ATTEMPTS, async () => {
      const data = await AsyncStorage.getItem(KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : [];
    });
  },

  async setAttempts(attempts: Attempt[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
    invalidateCache(KEYS.ATTEMPTS);
  },

  async isInitialized(): Promise<boolean> {
    return getCachedOrFetch(KEYS.INITIALIZED, async () => {
      const data = await AsyncStorage.getItem(KEYS.INITIALIZED);
      return data === "true";
    });
  },

  async setInitialized(): Promise<void> {
    await AsyncStorage.setItem(KEYS.INITIALIZED, "true");
    invalidateCache(KEYS.INITIALIZED);
  },
};
