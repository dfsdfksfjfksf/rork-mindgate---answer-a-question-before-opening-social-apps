import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Smartphone, Settings, Sliders } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { colors, spacing } from "@/constants/colors";
import { useEffect, useRef } from "react";

export default function DashboardScreen() {
  const { todayAttempts, todayAccuracy, quizSets, appAssignments } = useLearnLock();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const enabledAssignments = appAssignments.filter((a) => a.enabled);
  const timeSavedMinutes = Math.round(todayAttempts.length * 0.5);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.background, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Text style={styles.title}>LearnLock</Text>
            <Text style={styles.subtitle}>learn a little, then scroll a lot smarter</Text>
          </Animated.View>

          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <Text style={styles.statsTitle}>today</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayAccuracy}%</Text>
                <Text style={styles.statLabel}>accuracy</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayAttempts.length}</Text>
                <Text style={styles.statLabel}>attempts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{timeSavedMinutes}m</Text>
                <Text style={styles.statLabel}>time saved</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.tilesContainer}>
            <TouchableOpacity style={styles.tile} activeOpacity={0.8} onPress={() => router.push("/quizzes")}>
              <View style={styles.glassCard}>
                <View style={styles.tileIcon}>
                  <BookOpen size={28} color={colors.mint} strokeWidth={2} />
                </View>
                <Text style={styles.tileTitle}>quizzes</Text>
                <Text style={styles.tileSubtitle}>{quizSets.length} sets</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} activeOpacity={0.8} onPress={() => router.push("/apps")}>
              <View style={styles.glassCard}>
                <View style={styles.tileIcon}>
                  <Smartphone size={28} color={colors.lilac} strokeWidth={2} />
                </View>
                <Text style={styles.tileTitle}>apps</Text>
                <Text style={styles.tileSubtitle}>{enabledAssignments.length} active</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} activeOpacity={0.8} onPress={() => router.push("/settings")}>
              <View style={styles.glassCard}>
                <View style={styles.tileIcon}>
                  <Sliders size={28} color={colors.peach} strokeWidth={2} />
                </View>
                <Text style={styles.tileTitle}>settings</Text>
                <Text style={styles.tileSubtitle}>customize defaults</Text>
              </View>
            </TouchableOpacity>

            {enabledAssignments.length === 0 && (
              <TouchableOpacity style={[styles.tile, styles.setupTile]} activeOpacity={0.8} onPress={() => router.push("/setup")}>
                <LinearGradient
                  colors={[colors.gradient.start, colors.gradient.end]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.setupGradient}
                >
                  <Settings size={28} color="#fff" strokeWidth={2} />
                  <Text style={styles.setupTitle}>setup shortcuts</Text>
                  <Text style={styles.setupSubtitle}>finish setup to start</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>local-first • you&apos;re in control</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  background: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: "center" as const,
  },
  title: {
    fontSize: 36,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  tilesContainer: {
    gap: 16,
  },
  tile: {
    borderRadius: spacing.borderRadius.card,
    overflow: "hidden" as const,
  },
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 24,
    minHeight: 140,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tileIcon: {
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  tileSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500" as const,
  },
  setupTile: {
    marginTop: 8,
  },
  setupGradient: {
    padding: 24,
    minHeight: 140,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: spacing.borderRadius.card,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
  },
  setupSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500" as const,
  },
  footer: {
    marginTop: 40,
    alignItems: "center" as const,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    opacity: 0.6,
  },
});
