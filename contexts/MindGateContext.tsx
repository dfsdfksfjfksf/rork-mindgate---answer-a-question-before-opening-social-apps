import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import { storage } from "@/lib/storage";
import { seedQuizSets, seedQuestions, seedAppAssignments } from "@/lib/seed-data";
import type { QuizSet, Question, AppAssignment, Attempt } from "@/types";

export const [LearnLockProvider, useLearnLock] = createContextHook(() => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [appAssignments, setAppAssignments] = useState<AppAssignment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const initialized = await storage.isInitialized();
      
      if (!initialized) {
        await storage.setQuizSets(seedQuizSets);
        await storage.setQuestions(seedQuestions);
        await storage.setAppAssignments(seedAppAssignments);
        await storage.setAttempts([]);
        await storage.setInitialized();
        
        setQuizSets(seedQuizSets);
        setQuestions(seedQuestions);
        setAppAssignments(seedAppAssignments);
        setAttempts([]);
      } else {
        const [loadedQuizSets, loadedQuestions, loadedAssignments, loadedAttempts] = await Promise.all([
          storage.getQuizSets(),
          storage.getQuestions(),
          storage.getAppAssignments(),
          storage.getAttempts(),
        ]);
        
        setQuizSets(loadedQuizSets);
        setQuestions(loadedQuestions);
        setAppAssignments(loadedAssignments);
        setAttempts(loadedAttempts);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuizSet = useCallback(async (quizSet: Omit<QuizSet, "id" | "createdAt" | "updatedAt">) => {
    const newQuizSet: QuizSet = {
      ...quizSet,
      id: `quiz-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...quizSets, newQuizSet];
    setQuizSets(updated);
    await storage.setQuizSets(updated);
    return newQuizSet;
  }, [quizSets]);

  const updateQuizSet = useCallback(async (id: string, updates: Partial<QuizSet>) => {
    const updated = quizSets.map((q) =>
      q.id === id ? { ...q, ...updates, updatedAt: Date.now() } : q
    );
    setQuizSets(updated);
    await storage.setQuizSets(updated);
  }, [quizSets]);

  const deleteQuizSet = useCallback(async (id: string) => {
    const updated = quizSets.filter((q) => q.id !== id);
    setQuizSets(updated);
    await storage.setQuizSets(updated);
    
    const updatedQuestions = questions.filter((q) => q.quizSetId !== id);
    setQuestions(updatedQuestions);
    await storage.setQuestions(updatedQuestions);
  }, [quizSets, questions]);

  const addQuestion = useCallback(async (question: Omit<Question, "id" | "timesSeen" | "timesCorrect">) => {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
      timesSeen: 0,
      timesCorrect: 0,
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    await storage.setQuestions(updated);
    return newQuestion;
  }, [questions]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    setQuestions(updated);
    await storage.setQuestions(updated);
  }, [questions]);

  const deleteQuestion = useCallback(async (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    await storage.setQuestions(updated);
  }, [questions]);

  const addAppAssignment = useCallback(async (assignment: Omit<AppAssignment, "id">) => {
    const newAssignment: AppAssignment = {
      ...assignment,
      id: `app-${Date.now()}`,
    };
    const updated = [...appAssignments, newAssignment];
    setAppAssignments(updated);
    await storage.setAppAssignments(updated);
    return newAssignment;
  }, [appAssignments]);

  const updateAppAssignment = useCallback(async (id: string, updates: Partial<AppAssignment>) => {
    const updated = appAssignments.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAppAssignments(updated);
    await storage.setAppAssignments(updated);
  }, [appAssignments]);

  const deleteAppAssignment = useCallback(async (id: string) => {
    const updated = appAssignments.filter((a) => a.id !== id);
    setAppAssignments(updated);
    await storage.setAppAssignments(updated);
  }, [appAssignments]);

  const addAttempt = useCallback(async (attempt: Omit<Attempt, "id" | "timestamp">) => {
    const newAttempt: Attempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      timestamp: Date.now(),
    };
    const updated = [...attempts, newAttempt];
    setAttempts(updated);
    await storage.setAttempts(updated);

    const question = questions.find((q) => q.id === attempt.questionId);
    if (question) {
      await updateQuestion(question.id, {
        timesSeen: question.timesSeen + 1,
        timesCorrect: question.timesCorrect + (attempt.isCorrect ? 1 : 0),
      });
    }

    return newAttempt;
  }, [attempts, questions, updateQuestion]);

  const getQuestionsForQuizSet = useCallback((quizSetId: string) => {
    return questions.filter((q) => q.quizSetId === quizSetId);
  }, [questions]);

  const getAppAssignmentByName = useCallback((appName: string) => {
    return appAssignments.find(
      (a) => a.appName.toLowerCase() === appName.toLowerCase() && a.enabled
    );
  }, [appAssignments]);

  const todayAttempts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return attempts.filter((a) => a.timestamp >= today.getTime());
  }, [attempts]);

  const todayAccuracy = useMemo(() => {
    if (todayAttempts.length === 0) return 0;
    const correct = todayAttempts.filter((a) => a.isCorrect).length;
    return Math.round((correct / todayAttempts.length) * 100);
  }, [todayAttempts]);

  return useMemo(() => ({
    quizSets,
    questions,
    appAssignments,
    attempts,
    isLoading,
    addQuizSet,
    updateQuizSet,
    deleteQuizSet,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addAppAssignment,
    updateAppAssignment,
    deleteAppAssignment,
    addAttempt,
    getQuestionsForQuizSet,
    getAppAssignmentByName,
    todayAttempts,
    todayAccuracy,
  }), [quizSets, questions, appAssignments, attempts, isLoading, addQuizSet, updateQuizSet, deleteQuizSet, addQuestion, updateQuestion, deleteQuestion, addAppAssignment, updateAppAssignment, deleteAppAssignment, addAttempt, getQuestionsForQuizSet, getAppAssignmentByName, todayAttempts, todayAccuracy]);
});
