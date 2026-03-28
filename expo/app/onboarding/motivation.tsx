import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Brain, Clock, TrendingUp, Zap } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef } from "react";

export default function MotivationScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { app } = useLocalSearchParams<{ app: string }>();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push(`/onboarding/topic-selection?app=${encodeURIComponent(app || '')}` as any);
  };

  const handleBack = () => {
    router.back();
  };

  const getAppIcon = (appName: string) => {
    const icons: { [key: string]: string } = {
      "TikTok": "🎵",
      "Instagram": "📸",
      "Snapchat": "👻",
      "YouTube": "📺",
      "Twitter": "🐦",
      "Facebook": "👥",
      "Reddit": "🤖",
      "Discord": "🎮",
    };
    return icons[appName] || "📱";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.background, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.heroSection}>
            <View style={styles.appIconContainer}>
              <Text style={styles.appIcon}>{getAppIcon(app || '')}</Text>
              <View style={[styles.arrowContainer, { backgroundColor: colors.mint }]}>
                <ArrowRight size={16} color="#fff" />
              </View>
              <View style={[styles.brainContainer, { backgroundColor: colors.lilac }]}>
                <Brain size={20} color="#fff" />
              </View>
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>
              Well, every time you use {app}...
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              You could be expanding your knowledge
            </Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Transform your screen time into learning time with quick knowledge checks
            </Text>
          </View>

          <View style={styles.benefitsSection}>
            <View style={[styles.benefitCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Clock size={24} color={colors.mint} />
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Just 30 seconds</Text>
                <Text style={[styles.benefitDescription, { color: colors.textMuted }]}>
                  Quick questions that don't interrupt your flow
                </Text>
              </View>
            </View>

            <View style={[styles.benefitCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <TrendingUp size={24} color={colors.lilac} />
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Daily growth</Text>
                <Text style={[styles.benefitDescription, { color: colors.textMuted }]}>
                  Learn something new every time you scroll
                </Text>
              </View>
            </View>

            <View style={[styles.benefitCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Zap size={24} color={colors.peach} />
              <View style={styles.benefitText}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>Mindful habits</Text>
                <Text style={[styles.benefitDescription, { color: colors.textMuted }]}>
                  Build awareness around your app usage
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradient.start, colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.continueText}>Let's do it!</Text>
              <ArrowRight size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
  },
  progressContainer: {
    flexDirection: "row" as const,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  heroSection: {
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  appIconContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 32,
    gap: 16,
  },
  appIcon: {
    fontSize: 48,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  brainContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    flex: 1,
    paddingTop: 20,
    gap: 16,
  },
  benefitCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
  },
  benefitText: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
  },
  continueButton: {
    width: "100%",
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
  continueText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
