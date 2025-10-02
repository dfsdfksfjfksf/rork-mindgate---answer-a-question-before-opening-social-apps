import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Linking, Animated } from "react-native";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, XCircle, ExternalLink, AlertCircle, Lock } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/colors";
import type { Question } from "@/types";

export default function GateScreen() {
  const { app } = useLocalSearchParams<{ app: string }>();
  const insets = useSafeAreaInsets();
  const {
    getAppAssignmentByName,
    getQuestionsForQuizSet,
    addAttempt,
  } = useLearnLock();

  const assignment = useMemo(() => {
    if (!app) return null;
    return getAppAssignmentByName(app);
  }, [app, getAppAssignmentByName]);

  const questions = useMemo(() => {
    if (!assignment) return [];
    return getQuestionsForQuizSet(assignment.quizSetId);
  }, [assignment, getQuestionsForQuizSet]);

  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      loadNextQuestion();
    }
  }, [questions, currentQuestion]);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const loadNextQuestion = () => {
    if (questions.length === 0) return;

    let nextQuestion: Question;
    if (assignment?.randomize) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      nextQuestion = questions[randomIndex];
    } else {
      const unseenQuestions = questions.filter((q) => q.timesSeen === 0);
      if (unseenQuestions.length > 0) {
        nextQuestion = unseenQuestions[0];
      } else {
        nextQuestion = questions[0];
      }
    }

    setCurrentQuestion(nextQuestion);
    setUserAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  };

  const checkAnswer = async () => {
    if (!currentQuestion || !assignment) return;

    let correct = false;

    if (currentQuestion.type === "mcq") {
      correct = userAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "short_answer" && currentQuestion.acceptableAnswers) {
      const normalizedAnswer = userAnswer.trim().toLowerCase();
      correct = currentQuestion.acceptableAnswers.some(
        (acceptable) => acceptable.toLowerCase() === normalizedAnswer
      );
    }

    setIsCorrect(correct);
    setShowResult(true);

    await addAttempt({
      appAssignmentId: assignment.id,
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect: correct,
    });

    if (Platform.OS !== "web") {
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    if (correct) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);

      if (newStreak >= assignment.requireStreak) {
        setTimeout(() => {
          setShowSuccess(true);
        }, 800);
      } else {
        setTimeout(() => {
          loadNextQuestion();
        }, 1500);
      }
    } else {
      setCurrentStreak(0);
      if (assignment.cooldownSeconds > 0) {
        setCooldownRemaining(assignment.cooldownSeconds);
      }
    }
  };

  const handleContinue = async () => {
    if (!assignment?.schemeOrStoreURL) return;

    const url = assignment.schemeOrStoreURL;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.log("Cannot open URL:", url);
    }
  };

  if (!app) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.peach} />
          <Text style={styles.errorTitle}>No App Specified</Text>
          <Text style={styles.errorText}>Please provide an app name in the URL</Text>
        </View>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.peach} />
          <Text style={styles.errorTitle}>Assignment Not Found</Text>
          <Text style={styles.errorText}>
            No enabled assignment found for &quot;{app}&quot;. Please configure it in App Assignments.
          </Text>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.peach} />
          <Text style={styles.errorTitle}>No Questions Available</Text>
          <Text style={styles.errorText}>
            The assigned quiz set has no questions. Please add questions first.
          </Text>
        </View>
      </View>
    );
  }

  if (showSuccess) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successGradient}
        >
          <View style={styles.successContainer}>
            <CheckCircle size={80} color="#fff" strokeWidth={2.5} />
            <Text style={styles.successTitle}>unlocked ✓</Text>
            <Text style={styles.successText}>
              nice! continue to {app}.
            </Text>
            {assignment.schemeOrStoreURL ? (
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                <ExternalLink size={24} color="#fff" />
                <Text style={styles.continueButtonText}>Continue to {app}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noUrlText}>
                Add an app link in App Assignments to continue
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading question...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.lockIcon}>
            <Lock size={32} color={colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={styles.appName}>{app} is locked</Text>
          {assignment.requireStreak > 1 && (
            <View style={styles.streakContainer}>
              {Array.from({ length: assignment.requireStreak }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.streakDot,
                    i < currentStreak && styles.streakDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>

          {currentQuestion.type === "mcq" && currentQuestion.choices && (
            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    userAnswer === choice && styles.choiceButtonSelected,
                    showResult &&
                      choice === currentQuestion.correctAnswer &&
                      styles.choiceButtonCorrect,
                    showResult &&
                      userAnswer === choice &&
                      !isCorrect &&
                      styles.choiceButtonWrong,
                  ]}
                  onPress={() => !showResult && setUserAnswer(choice)}
                  disabled={showResult || cooldownRemaining > 0}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      userAnswer === choice && styles.choiceTextSelected,
                      showResult &&
                        choice === currentQuestion.correctAnswer &&
                        styles.choiceTextCorrect,
                    ]}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.type === "short_answer" && (
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.textMuted}
              value={userAnswer}
              onChangeText={setUserAnswer}
              editable={!showResult && cooldownRemaining === 0}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {showResult && currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>💡 {currentQuestion.explanation}</Text>
            </View>
          )}

          {showResult && (
            <View style={styles.resultContainer}>
              {isCorrect ? (
                <>
                  <CheckCircle size={32} color={colors.mint} strokeWidth={2.5} />
                  <Text style={styles.resultTextCorrect}>Correct!</Text>
                </>
              ) : (
                <>
                  <XCircle size={32} color={colors.peach} strokeWidth={2.5} />
                  <Text style={styles.resultTextWrong}>not quite—have a look:</Text>
                </>
              )}
            </View>
          )}

          {cooldownRemaining > 0 && (
            <View style={styles.cooldownContainer}>
              <Text style={styles.cooldownText}>
                try again in {cooldownRemaining}s
              </Text>
            </View>
          )}
        </Animated.View>

        {!showResult && cooldownRemaining === 0 && (
          <TouchableOpacity
            style={[styles.checkButton, !userAnswer.trim() && styles.checkButtonDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={userAnswer.trim() ? [colors.gradient.start, colors.gradient.end] : [colors.glass, colors.glass]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkButtonGradient}
            >
              <Text style={[styles.checkButtonText, !userAnswer.trim() && styles.checkButtonTextDisabled]}>
                Check Answer
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between" as const,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 32,
  },
  lockIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  appName: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: "row" as const,
    gap: 8,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  streakDotActive: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  questionCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: "center" as const,
  },
  questionPrompt: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 32,
    lineHeight: 32,
    textAlign: "center" as const,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.button,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  choiceButtonSelected: {
    borderColor: colors.mint,
    backgroundColor: "rgba(68, 224, 201, 0.1)",
  },
  choiceButtonCorrect: {
    borderColor: colors.mint,
    backgroundColor: "rgba(68, 224, 201, 0.15)",
  },
  choiceButtonWrong: {
    borderColor: colors.peach,
    backgroundColor: "rgba(255, 198, 168, 0.1)",
  },
  choiceText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center" as const,
    fontWeight: "500" as const,
  },
  choiceTextSelected: {
    color: colors.mint,
    fontWeight: "600" as const,
  },
  choiceTextCorrect: {
    color: colors.mint,
    fontWeight: "600" as const,
  },
  textInput: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.button,
    padding: 18,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    textAlign: "center" as const,
  },
  explanationContainer: {
    marginTop: 24,
    backgroundColor: "rgba(68, 224, 201, 0.08)",
    borderRadius: spacing.borderRadius.button,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(68, 224, 201, 0.2)",
  },
  explanationText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center" as const,
  },
  resultContainer: {
    marginTop: 24,
    alignItems: "center" as const,
    gap: 12,
  },
  resultTextCorrect: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  resultTextWrong: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.textMuted,
  },
  cooldownContainer: {
    marginTop: 24,
    alignItems: "center" as const,
  },
  cooldownText: {
    fontSize: 16,
    color: colors.peach,
    fontWeight: "500" as const,
  },
  checkButton: {
    borderRadius: spacing.borderRadius.button,
    overflow: "hidden" as const,
    marginTop: 24,
  },
  checkButtonGradient: {
    padding: 18,
    alignItems: "center" as const,
  },
  checkButtonDisabled: {
    opacity: 0.4,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  checkButtonTextDisabled: {
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center" as const,
    lineHeight: 24,
  },
  successGradient: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 40,
  },
  successTitle: {
    fontSize: 40,
    fontWeight: "600" as const,
    color: "#fff",
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
    marginBottom: 40,
  },
  continueButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: spacing.borderRadius.button,
    borderWidth: 2,
    borderColor: "#fff",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  noUrlText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
});
