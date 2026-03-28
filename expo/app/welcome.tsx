import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, ArrowRight, Brain, Target, Zap } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef } from "react";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/onboarding/app-selection" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.background, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 40 }]}>
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: colors.mint }]}>
              <Brain size={32} color="#fff" strokeWidth={2} />
            </View>
            <View style={[styles.iconAccent, { backgroundColor: colors.lilac }]}>
              <Sparkles size={16} color="#fff" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>LearnLock</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Add a little productivity into each day
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View 
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.featureCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Target size={24} color={colors.mint} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Blocking</Text>
              <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                Answer questions before accessing distracting apps
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Zap size={24} color={colors.lilac} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Learn Daily</Text>
              <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                Expand your knowledge with every scroll session
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Brain size={24} color={colors.peach} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Build Habits</Text>
              <Text style={[styles.featureDescription, { color: colors.textMuted }]}>
                Transform mindless scrolling into mindful learning
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View 
          style={[
            styles.ctaSection,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradient.start, colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <ArrowRight size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Transform your screen time in just 2 minutes
          </Text>
        </Animated.View>
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
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: "center" as const,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    position: "relative" as const,
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  iconAccent: {
    position: "absolute" as const,
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center" as const,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresSection: {
    flex: 1,
    paddingVertical: 20,
    gap: 16,
  },
  featureCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: 40,
    alignItems: "center" as const,
  },
  getStartedButton: {
    width: "100%",
    marginBottom: 16,
  },
  gradientButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: spacing.borderRadius.button,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center" as const,
  },
});
