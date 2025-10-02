import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Settings, Lock, CheckCircle, Circle, Plus, FileText, Play, Target } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useMemo, memo } from "react";

// Memoized stat chip component
const StatChip = memo(function StatChip({ value, label, colors, onPress }: { value: string | number; label: string; colors: any; onPress?: () => void }) {
  return (
  <TouchableOpacity 
    style={[styles.statChip, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <Text style={[styles.statChipValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statChipLabel, { color: colors.textMuted }]}>{label}</Text>
  </TouchableOpacity>
  );
});

export default function DashboardScreen() {
  const { todayAttempts, todayAccuracy, quizSets, appAssignments, attempts } = useLearnLock();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Memoize expensive calculations
  const enabledAssignments = useMemo(() => 
    appAssignments.filter((a) => a.enabled), 
    [appAssignments]
  );
  
  const setupCompletedCount = useMemo(() => 
    enabledAssignments.filter((a) => a.setupCompleted).length,
    [enabledAssignments]
  );

  const allSetupsComplete = useMemo(() => 
    enabledAssignments.length > 0 && setupCompletedCount === enabledAssignments.length,
    [enabledAssignments.length, setupCompletedCount]
  );

  const bestStreak = useMemo(() => {
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const attempt of sortedAttempts) {
      if (attempt.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  }, [attempts]);

  const dailyGoal = 5;
  const answeredToday = todayAttempts.filter(a => a.isCorrect).length;

  const lastFailedApp = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentFails = attempts
      .filter(a => !a.isCorrect && a.timestamp >= oneDayAgo)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (recentFails.length > 0) {
      const assignment = appAssignments.find(a => a.id === recentFails[0].appAssignmentId);
      return assignment?.appName;
    }
    return null;
  }, [attempts, appAssignments]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.background, { backgroundColor: colors.ink, paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Compact Header */}
          <Animated.View style={[styles.compactHeader, { opacity: fadeAnim }]}>
            <View style={styles.headerLeft}>
              <Lock size={36} color={colors.mint} strokeWidth={2.5} />
              <View style={styles.headerTextContainer}>
                <Text style={[styles.appTitle, { color: colors.text }]}>LearnLock</Text>
                <Text style={[styles.tagline, { color: colors.textMuted }]}>learn a little, then scroll smarter</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.settingsButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Primary CTA */}
          <Animated.View style={[styles.ctaContainer, { opacity: fadeAnim }]}>
            {!allSetupsComplete && enabledAssignments.length > 0 ? (
              <TouchableOpacity 
                style={styles.primaryCta}
                onPress={() => router.push("/setup")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.gradient.start, colors.gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaTitle}>Finish setup</Text>
                  <Text style={styles.ctaSubtext}>{setupCompletedCount}/{enabledAssignments.length} apps done</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.ctaGroup}>
                <TouchableOpacity 
                  style={styles.primaryCta}
                  onPress={() => router.push("/gate?app=Preview")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.gradient.start, colors.gradient.end]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaTitle}>Start 5-question drill</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push("/gate?app=Preview")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryLink, { color: colors.mint }]}>Preview gate</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Today Strip */}
          <Animated.View style={[styles.todayStrip, { opacity: fadeAnim }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>today</Text>
            <View style={styles.chipsRow}>
              <StatChip value={`${todayAccuracy}%`} label="accuracy" colors={colors} />
              <StatChip value={todayAttempts.length} label="attempts" colors={colors} />
              <StatChip value={bestStreak} label="best streak" colors={colors} />
              <View style={[styles.goalChip, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.goalRing}>
                  <View style={[styles.goalRingProgress, { borderColor: colors.mint }]}>
                    <Text style={[styles.goalRingText, { color: colors.text }]}>{answeredToday}/{dailyGoal}</Text>
                  </View>
                </View>
                <Text style={[styles.statChipLabel, { color: colors.textMuted }]}>goal</Text>
              </View>
            </View>
          </Animated.View>

          {/* Automations Card */}
          {enabledAssignments.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>automations</Text>
                  <Text style={[styles.cardSubtext, { color: colors.textMuted }]}>
                    {allSetupsComplete ? "All set 🎉" : `${setupCompletedCount}/${enabledAssignments.length} set up`}
                  </Text>
                </View>
                {!allSetupsComplete && (
                  <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: colors.mint }]}
                    onPress={() => router.push("/setup")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cardButtonText}>Complete setup</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.appChipsContainer}>
                {enabledAssignments.map((assignment) => (
                  <View 
                    key={assignment.id} 
                    style={[styles.appChip, { 
                      backgroundColor: assignment.setupCompleted ? "rgba(68, 224, 201, 0.1)" : colors.glass,
                      borderColor: assignment.setupCompleted ? colors.mint : colors.glassBorder 
                    }]}
                  >
                    {assignment.setupCompleted ? (
                      <CheckCircle size={14} color={colors.mint} />
                    ) : (
                      <Circle size={14} color={colors.textMuted} />
                    )}
                    <Text style={[styles.appChipText, { color: assignment.setupCompleted ? colors.mint : colors.textMuted }]}>
                      {assignment.appName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quizzes Card */}
          <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>quizzes</Text>
                {quizSets.length > 0 && (
                  <Text style={[styles.cardSubtext, { color: colors.textMuted }]}>
                    {quizSets[0].name} • {quizSets[0].topic || "10 Qs"}
                  </Text>
                )}
              </View>
            </View>
            {quizSets.length > 1 && (
              <Text style={[styles.secondaryQuizText, { color: colors.textMuted }]}>
                + {quizSets.length - 1} more set{quizSets.length > 2 ? "s" : ""}
              </Text>
            )}
            <View style={styles.inlineActions}>
              <TouchableOpacity 
                style={[styles.inlineActionButton, { borderColor: colors.glassBorder }]}
                onPress={() => router.push("/quizzes")}
                activeOpacity={0.7}
              >
                <Plus size={16} color={colors.mint} />
                <Text style={[styles.inlineActionText, { color: colors.mint }]}>New quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.inlineActionButton, { borderColor: colors.glassBorder }]}
                onPress={() => router.push("/quizzes")}
                activeOpacity={0.7}
              >
                <FileText size={16} color={colors.lilac} />
                <Text style={[styles.inlineActionText, { color: colors.lilac }]}>Import CSV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Apps Card */}
          <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>apps</Text>
            {enabledAssignments.length > 0 ? (
              <View style={styles.appsList}>
                {enabledAssignments.slice(0, 3).map((assignment) => {
                  const quizSet = quizSets.find(q => q.id === assignment.quizSetId);
                  return (
                    <View key={assignment.id} style={styles.appRow}>
                      <View style={styles.appRowLeft}>
                        <Text style={[styles.appRowName, { color: colors.text }]}>{assignment.appName}</Text>
                        <Text style={[styles.appRowQuiz, { color: colors.textMuted }]}>→ {quizSet?.name || "Unknown"}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.testGateButton, { borderColor: colors.mint }]}
                        onPress={() => router.push(`/gate?app=${assignment.appName}`)}
                        activeOpacity={0.7}
                      >
                        <Play size={14} color={colors.mint} />
                        <Text style={[styles.testGateText, { color: colors.mint }]}>Test gate</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No apps enabled yet</Text>
            )}
          </View>

          {/* Continue Strip */}
          <View style={[styles.continueCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            {lastFailedApp ? (
              <TouchableOpacity 
                style={styles.continueContent}
                onPress={() => router.push(`/gate?app=${lastFailedApp}`)}
                activeOpacity={0.8}
              >
                <Target size={20} color={colors.peach} />
                <Text style={[styles.continueText, { color: colors.text }]}>Try again on {lastFailedApp}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.continueContent}
                onPress={() => router.push("/gate?app=Preview")}
                activeOpacity={0.8}
              >
                <Play size={20} color={colors.mint} />
                <Text style={[styles.continueText, { color: colors.text }]}>Preview gate</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>local-first • you&apos;re in control</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  compactHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
  },
  ctaContainer: {
    marginBottom: 24,
  },
  ctaGroup: {
    gap: 12,
    alignItems: "center" as const,
  },
  primaryCta: {
    borderRadius: spacing.borderRadius.button,
    overflow: "hidden" as const,
    width: "100%",
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center" as const,
    minHeight: 56,
    justifyContent: "center" as const,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  ctaSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  secondaryLink: {
    fontSize: 15,
    fontWeight: "500" as const,
    textDecorationLine: "underline" as const,
  },
  todayStrip: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  statChip: {
    flex: 1,
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    alignItems: "center" as const,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: "center" as const,
  },
  statChipValue: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  statChipLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  goalChip: {
    flex: 1,
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    alignItems: "center" as const,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: "center" as const,
  },
  goalRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  goalRingProgress: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  goalRingText: {
    fontSize: 9,
    fontWeight: "600" as const,
  },
  card: {
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  cardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.button,
  },
  cardButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  appChipsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  appChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.chip,
    borderWidth: 1,
  },
  appChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  secondaryQuizText: {
    fontSize: 13,
    marginBottom: 12,
  },
  inlineActions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  inlineActionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: spacing.borderRadius.button,
    borderWidth: 1,
  },
  inlineActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  appsList: {
    gap: 12,
    marginTop: 12,
  },
  appRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  appRowLeft: {
    flex: 1,
  },
  appRowName: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  appRowQuiz: {
    fontSize: 12,
  },
  testGateButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.chip,
    borderWidth: 1,
  },
  testGateText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic" as const,
    marginTop: 8,
  },
  continueCard: {
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  continueContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  continueText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  footer: {
    marginTop: 24,
    alignItems: "center" as const,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
