import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Smartphone, Settings, Sliders, Lock } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useMemo, memo } from "react";

// Memoized stat card component
const StatCard = memo(({ value, label, colors }: { value: string | number; label: string; colors: any }) => (
  <View style={[styles.statCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
));

// Memoized tile component
const DashboardTile = memo(({ 
  icon, 
  title, 
  subtitle, 
  colors, 
  iconColor, 
  onPress 
}: { 
  icon: any; 
  title: string; 
  subtitle: string; 
  colors: any; 
  iconColor: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.tile} activeOpacity={0.8} onPress={onPress}>
    <View style={[styles.glassCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      <View style={styles.tileIcon}>
        {icon}
      </View>
      <Text style={[styles.tileTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.tileSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
));

export default function DashboardScreen() {
  const { todayAttempts, todayAccuracy, quizSets, appAssignments } = useLearnLock();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Memoize expensive calculations
  const enabledAssignments = useMemo(() => 
    appAssignments.filter((a) => a.enabled), 
    [appAssignments]
  );
  
  const timeSavedMinutes = useMemo(() => 
    Math.round(todayAttempts.length * 0.5), 
    [todayAttempts.length]
  );

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
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Lock size={48} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>LearnLock</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>learn a little, then scroll a lot smarter</Text>
          </Animated.View>

          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <Text style={[styles.statsTitle, { color: colors.textMuted }]}>today</Text>
            <View style={styles.statsRow}>
              <StatCard value={`${todayAccuracy}%`} label="accuracy" colors={colors} />
              <StatCard value={todayAttempts.length} label="attempts" colors={colors} />
              <StatCard value={`${timeSavedMinutes}m`} label="time saved" colors={colors} />
            </View>
          </Animated.View>

          <View style={styles.tilesContainer}>
            <DashboardTile
              icon={<BookOpen size={28} color={colors.mint} strokeWidth={2} />}
              title="quizzes"
              subtitle={`${quizSets.length} sets`}
              colors={colors}
              iconColor={colors.mint}
              onPress={() => router.push("/quizzes")}
            />

            <DashboardTile
              icon={<Smartphone size={28} color={colors.lilac} strokeWidth={2} />}
              title="apps"
              subtitle={`${enabledAssignments.length} active`}
              colors={colors}
              iconColor={colors.lilac}
              onPress={() => router.push("/apps")}
            />

            <DashboardTile
              icon={<Sliders size={28} color={colors.peach} strokeWidth={2} />}
              title="settings"
              subtitle="customize defaults"
              colors={colors}
              iconColor={colors.peach}
              onPress={() => router.push("/settings")}
            />

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
  header: {
    marginBottom: 40,
    alignItems: "center" as const,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    fontSize: 36,
    fontWeight: "600" as const,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
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
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    alignItems: "center" as const,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    borderRadius: spacing.borderRadius.card,
    padding: 24,
    minHeight: 140,
    justifyContent: "center" as const,
    borderWidth: 1,
  },
  tileIcon: {
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  tileSubtitle: {
    fontSize: 14,
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
    opacity: 0.6,
  },
});
