import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Linking, Animated } from "react-native";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, XCircle, ExternalLink, AlertCircle, Lock, ArrowLeft, Home, RefreshCw } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/colors";
import type { Question } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppSettings } from "./settings";

const SETTINGS_KEY = "learnlock_settings";

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
  const cooldownProgress = useRef(new Animated.Value(1)).current;
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState<boolean>(false);
  const resultFadeAnim = useRef(new Animated.Value(0)).current;
  const resultScaleAnim = useRef(new Animated.Value(0.95)).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successFadeAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0.9)).current;

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
    loadSettings();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      loadNextQuestion();
    }
  }, [questions, currentQuestion]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  useEffect(() => {
    if (cooldownRemaining > 0 && assignment) {
      const effectiveCooldown = settings?.defaultCooldownSeconds ?? assignment.cooldownSeconds;
      const progress = cooldownRemaining / effectiveCooldown;
      Animated.timing(cooldownProgress, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      cooldownProgress.setValue(1);
    }
  }, [cooldownRemaining, assignment, cooldownProgress, settings]);

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      successFadeAnim.setValue(0);
      successScaleAnim.setValue(0.9);
    }
  }, [showSuccess, successFadeAnim, successScaleAnim]);

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

  const checkAnswer = async (answer?: string) => {
    const answerToCheck = answer || userAnswer;
    if (!currentQuestion || !assignment || !answerToCheck.trim() || isCheckingAnswer) return;

    setIsCheckingAnswer(true);
    console.log("Checking answer:", answerToCheck);

    let correct = false;

    if (currentQuestion.type === "mcq") {
      correct = answerToCheck === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "short_answer" && currentQuestion.acceptableAnswers) {
      const normalizedAnswer = answerToCheck.trim().toLowerCase();
      correct = currentQuestion.acceptableAnswers.some(
        (acceptable) => acceptable.toLowerCase() === normalizedAnswer
      );
    }

    console.log("Answer is correct:", correct);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setIsCorrect(correct);
    setShowResult(true);
    
    resultFadeAnim.setValue(0);
    resultScaleAnim.setValue(0.95);
    Animated.parallel([
      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(resultScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    await addAttempt({
      appAssignmentId: assignment.id,
      questionId: currentQuestion.id,
      userAnswer: answerToCheck,
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

      const effectiveRequireStreak = settings?.defaultRequireStreak ?? assignment.requireStreak;
      if (newStreak >= effectiveRequireStreak) {
        setTimeout(() => {
          setShowSuccess(true);
          setIsCheckingAnswer(false);
        }, 1000);
      } else {
        setTimeout(() => {
          loadNextQuestion();
          setIsCheckingAnswer(false);
        }, 1800);
      }
    } else {
      setCurrentStreak(0);
      const effectiveCooldown = settings?.defaultCooldownSeconds ?? assignment.cooldownSeconds;
      const cooldown = effectiveCooldown > 0 ? effectiveCooldown : 5;
      setCooldownRemaining(cooldown);
      setIsCheckingAnswer(false);
    }
  };

  const handleContinue = async () => {
    if (!assignment?.schemeOrStoreURL) return;

    let url = assignment.schemeOrStoreURL;
    
    if (!url.includes('://')) {
      url = url + '://';
    }
    
    console.log('Attempting to open URL:', url);
    
    try {
      const supported = await Linking.canOpenURL(url);
      console.log('URL supported:', supported);
      
      if (supported) {
        await Linking.openURL(url);
        console.log('Successfully opened:', url);
      } else {
        console.warn('Cannot open URL:', url);
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          alert(`Unable to open ${app}. The app may not be installed on your device.`);
        }
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      if (Platform.OS === 'web') {
        try {
          window.open(url, '_blank');
        } catch (e) {
          alert(`Error opening ${app}: ${error}`);
        }
      } else {
        alert(`Error opening ${app}. The app may not be installed.`);
      }
    }
  };

  if (!app) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
            <Home size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
            <Home size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
            <Home size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
            <Home size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successGradient}
        >
          <Animated.View 
            style={[
              styles.successContainer,
              {
                opacity: successFadeAnim,
                transform: [{ scale: successScaleAnim }],
              },
            ]}
          >
            <CheckCircle size={80} color="#fff" strokeWidth={2.5} />
            <Text style={styles.successTitle}>unlocked ✓</Text>
            <Text style={styles.successText}>
              nice! continue to {app}.
            </Text>
            <View style={styles.successButtonsContainer}>
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
              <TouchableOpacity 
                style={styles.anotherQuestionButton} 
                onPress={() => {
                  setShowSuccess(false);
                  setCurrentStreak(0);
                  loadNextQuestion();
                }} 
                activeOpacity={0.8}
              >
                <RefreshCw size={20} color="#fff" />
                <Text style={styles.anotherQuestionButtonText}>Answer Another Question</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
            <Home size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading question...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/")} style={styles.homeButton}>
          <Home size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
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
                  onPress={() => {
                    if (!showResult && cooldownRemaining === 0 && !isCheckingAnswer) {
                      setUserAnswer(choice);
                      checkAnswer(choice);
                    }
                  }}
                  disabled={showResult || cooldownRemaining > 0 || isCheckingAnswer}
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

          {showResult && (
            <Animated.View 
              style={[
                styles.resultContainer,
                {
                  opacity: resultFadeAnim,
                  transform: [{ scale: resultScaleAnim }],
                },
              ]}
            >
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
            </Animated.View>
          )}

          {showResult && currentQuestion.explanation && (
            <Animated.View 
              style={[
                styles.explanationContainer,
                {
                  opacity: resultFadeAnim,
                  transform: [{ scale: resultScaleAnim }],
                },
              ]}
            >
              <Text style={styles.explanationText}>💡 {currentQuestion.explanation}</Text>
            </Animated.View>
          )}

          {cooldownRemaining > 0 && (
            <View style={styles.cooldownContainer}>
              <Text style={styles.cooldownText}>
                try again in {cooldownRemaining}s
              </Text>
              <View style={styles.cooldownBarContainer}>
                <Animated.View
                  style={[
                    styles.cooldownBar,
                    {
                      width: cooldownProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Animated.View>

        {!showResult && cooldownRemaining === 0 && currentQuestion.type === "short_answer" && (
          <TouchableOpacity
            style={[styles.checkButton, (!userAnswer.trim() || isCheckingAnswer) && styles.checkButtonDisabled]}
            onPress={() => checkAnswer()}
            disabled={!userAnswer.trim() || isCheckingAnswer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={userAnswer.trim() && !isCheckingAnswer ? [colors.gradient.start, colors.gradient.end] : [colors.glass, colors.glass]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkButtonGradient}
            >
              <Text style={[styles.checkButtonText, (!userAnswer.trim() || isCheckingAnswer) && styles.checkButtonTextDisabled]}>
                {isCheckingAnswer ? "Checking..." : "Check Answer"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {showResult && !isCorrect && cooldownRemaining === 0 && (
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() => {
              console.log("Try again pressed - loading new question");
              loadNextQuestion();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.tryAgainButtonText}>Try Again</Text>
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
    marginBottom: 12,
  },
  cooldownBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.glass,
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  cooldownBar: {
    height: '100%',
    backgroundColor: colors.peach,
    borderRadius: 2,
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
  successButtonsContainer: {
    width: '100%',
    gap: 16,
    alignItems: "center" as const,
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
  backButtonContainer: {
    position: "absolute" as const,
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  tryAgainButton: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.button,
    padding: 18,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.mint,
    alignItems: "center" as const,
  },
  tryAgainButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  anotherQuestionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: spacing.borderRadius.button,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  anotherQuestionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
