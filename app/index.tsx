import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Settings, Lock, CheckCircle, Circle, Plus, FileText, Play } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useMemo, memo, useCallback } from "react";

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

// Memoized app chip component
const AppChip = memo(function AppChip({ assignment, colors }: { assignment: any; colors: any }) {
  const chipStyle = useMemo(() => [
    styles.appChip, 
    { 
      backgroundColor: assignment.setupCompleted ? "rgba(68, 224, 201, 0.1)" : colors.glass,
      borderColor: assignment.setupCompleted ? colors.mint : colors.glassBorder 
    }
  ], [assignment.setupCompleted, colors.glass, colors.glassBorder, colors.mint]);

  const textStyle = useMemo(() => [
    styles.appChipText, 
    { color: assignment.setupCompleted ? colors.mint : colors.textMuted }
  ], [assignment.setupCompleted, colors.mint, colors.textMuted]);

  return (
    <View style={chipStyle}>
      {assignment.setupCompleted ? (
        <CheckCircle size={14} color={colors.mint} />
      ) : (
        <Circle size={14} color={colors.textMuted} />
      )}
      <Text style={textStyle}>
        {assignment.appName}
      </Text>
    </View>
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
    if (attempts.length === 0) return 0;
    
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Sort only once and reuse
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
  
  const answeredToday = useMemo(() => 
    todayAttempts.filter(a => a.isCorrect).length,
    [todayAttempts]
  );


  // Memoized navigation callbacks
  const handleSettingsPress = useCallback(() => {
    router.push("/settings");
  }, []);

  const handleSetupPress = useCallback(() => {
    router.push("/setup");
  }, []);

  const handlePreviewGatePress = useCallback(() => {
    router.push("/gate?app=Preview");
  }, []);

  const handleAppsPress = useCallback(() => {
    router.push("/apps");
  }, []);

  const handleQuizzesPress = useCallback(() => {
    router.push("/quizzes");
  }, []);

  const handleTestGate = useCallback((appName: string) => {
    router.push(`/gate?app=${appName}`);
  }, []);


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
              onPress={handleSettingsPress}
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
                onPress={handleSetupPress}
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
                  onPress={handlePreviewGatePress}
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
                  onPress={handlePreviewGatePress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryLink, { color: colors.mint }]}>Preview gate</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Today Strip */}
          <Animated.View style={[styles.todayStrip, { opacity: fadeAnim }]}>
            <View style={styles.todayHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>today's progress</Text>
              <View style={[styles.todayBadge, { backgroundColor: answeredToday >= dailyGoal ? "rgba(68, 224, 201, 0.2)" : "rgba(255, 255, 255, 0.1)" }]}>
                <Text style={[styles.todayBadgeText, { color: answeredToday >= dailyGoal ? colors.mint : colors.textMuted }]}>
                  {answeredToday >= dailyGoal ? "Goal reached! 🎉" : `${dailyGoal - answeredToday} to go`}
                </Text>
              </View>
            </View>
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
                onPress={handleQuizzesPress}
                activeOpacity={0.7}
              >
                <Plus size={16} color={colors.mint} />
                <Text style={[styles.inlineActionText, { color: colors.mint }]}>New quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.inlineActionButton, { borderColor: colors.glassBorder }]}
                onPress={handleQuizzesPress}
                activeOpacity={0.7}
              >
                <FileText size={16} color={colors.lilac} />
                <Text style={[styles.inlineActionText, { color: colors.lilac }]}>Import CSV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Apps Card */}
          <Animated.View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder, opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>blocked apps</Text>
                <Text style={[styles.cardSubtext, { color: colors.textMuted }]}>
                  {enabledAssignments.length > 0 
                    ? `${enabledAssignments.length} app${enabledAssignments.length > 1 ? 's' : ''} blocked`
                    : "Add apps to block with learning gates"
                  }
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.cardButton, { backgroundColor: colors.mint }]}
                onPress={handleAppsPress}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.cardButtonText}>Add apps</Text>
              </TouchableOpacity>
            </View>
            
            {enabledAssignments.length > 0 ? (
              <View style={styles.appsGrid}>
                {enabledAssignments.map((assignment) => {
                  const quizSet = quizSets.find(q => q.id === assignment.quizSetId);
                  return (
                    <View key={assignment.id} style={[styles.appCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                      <View style={styles.appCardHeader}>
                        <View style={[styles.appIcon, { backgroundColor: assignment.setupCompleted ? "rgba(68, 224, 201, 0.2)" : "rgba(255, 255, 255, 0.1)" }]}>
                          <Text style={[styles.appIconText, { color: assignment.setupCompleted ? colors.mint : colors.textMuted }]}>
                            {assignment.appName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.appCardInfo}>
                          <Text style={[styles.appCardName, { color: colors.text }]}>{assignment.appName}</Text>
                          <Text style={[styles.appCardQuiz, { color: colors.textMuted }]}>{quizSet?.name || "No quiz set"}</Text>
                        </View>
                        {assignment.setupCompleted && (
                          <View style={[styles.statusBadge, { backgroundColor: "rgba(68, 224, 201, 0.2)" }]}>
                            <CheckCircle size={12} color={colors.mint} />
                          </View>
                        )}
                      </View>
                      <TouchableOpacity 
                        style={[styles.testButton, { borderColor: colors.mint }]}
                        onPress={() => handleTestGate(assignment.appName)}
                        activeOpacity={0.7}
                      >
                        <Play size={12} color={colors.mint} />
                        <Text style={[styles.testButtonText, { color: colors.mint }]}>Test gate</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Lock size={32} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No apps blocked yet</Text>
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  Add social media apps to create learning gates that help you build better habits
                </Text>
              </View>
            )}
          </Animated.View>


          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Lock size={16} color={colors.mint} />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>local-first • you're in control</Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>LearnLock v1.0.0</Text>
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
  todayHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
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
  // New enhanced apps section styles
  appsGrid: {
    gap: 12,
    marginTop: 4,
  },
  appCard: {
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    borderWidth: 1,
  },
  appCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  appIconText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  appCardInfo: {
    flex: 1,
  },
  appCardName: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  appCardQuiz: {
    fontSize: 12,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  testButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.button,
    borderWidth: 1,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    alignItems: "center" as const,
    paddingBottom: 20,
  },
  footerCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  versionText: {
    fontSize: 11,
    opacity: 0.5,
  },
});
