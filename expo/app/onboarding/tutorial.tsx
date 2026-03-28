import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Copy, ExternalLink, Smartphone, Settings, Plus, Play, CheckCircle } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLearnLock } from "@/contexts/MindGateContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";

export default function TutorialScreen() {
  const { colors } = useTheme();
  const { completeOnboarding } = useLearnLock();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { app, topic } = useLocalSearchParams<{ app: string; topic: string }>();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const baseUrl = Constants.expoConfig?.extra?.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://rork.com';
  const gateUrl = `${baseUrl}/gate?app=${encodeURIComponent(app || '')}`;

  const handleCopyUrl = async () => {
    await Clipboard.setStringAsync(gateUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleFinish = async () => {
    // Complete onboarding and navigate to main app
    await completeOnboarding();
    router.replace("/");
    // TODO: Create app assignment with selected topic
  };

  const handleBack = () => {
    router.back();
  };

  const steps = [
    {
      icon: Copy,
      title: "Copy the gate URL",
      description: "Copy the link below to use in your automation",
      action: (
        <TouchableOpacity
          style={[styles.urlContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
          onPress={handleCopyUrl}
          activeOpacity={0.8}
        >
          <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={1}>
            {gateUrl}
          </Text>
          <View style={[styles.copyButton, { backgroundColor: copiedUrl ? colors.mint : colors.glass }]}>
            {copiedUrl ? (
              <CheckCircle size={16} color="#fff" />
            ) : (
              <Copy size={16} color={colors.mint} />
            )}
          </View>
        </TouchableOpacity>
      )
    },
    {
      icon: Settings,
      title: "Open Shortcuts app",
      description: "Find and open the Shortcuts app on your iPhone",
      action: null
    },
    {
      icon: Plus,
      title: "Create Personal Automation",
      description: "Tap 'Automation' → '+' → 'Create Personal Automation'",
      action: null
    },
    {
      icon: Smartphone,
      title: "Choose 'App' trigger",
      description: `Select 'App' → Choose '${app}' → Select 'Is Opened'`,
      action: null
    },
    {
      icon: ExternalLink,
      title: "Add 'Open URLs' action",
      description: "Search for 'Open URLs' action and paste the copied link",
      action: null
    },
    {
      icon: Play,
      title: "Test & Save",
      description: "Turn off 'Ask Before Running' and save your automation",
      action: null
    }
  ];

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
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.titleSection}>
            <Settings size={48} color={colors.mint} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.text }]}>
              Set up your automation
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Follow these steps to create a Shortcuts automation for {app}
            </Text>
          </View>

          <ScrollView 
            style={styles.stepsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepsContent}
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <View key={index} style={[styles.stepCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.mint }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <IconComponent size={20} color={colors.mint} />
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.textMuted }]}>
                    {step.description}
                  </Text>
                  {step.action && (
                    <View style={styles.stepAction}>
                      {step.action}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={[styles.tipCard, { backgroundColor: "rgba(68, 224, 201, 0.1)", borderColor: colors.mint }]}>
              <Text style={[styles.tipTitle, { color: colors.mint }]}>💡 Pro Tip</Text>
              <Text style={[styles.tipText, { color: colors.text }]}>
                Make sure to turn off "Ask Before Running" so the automation works seamlessly every time you open {app}.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Finish Button */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradient.start, colors.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.finishText}>I've set it up!</Text>
              <CheckCircle size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.footerNote, { color: colors.textMuted }]}>
            You can always modify or disable this automation in the Shortcuts app
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
  },
  titleSection: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    flex: 1,
  },
  stepsContent: {
    gap: 16,
    paddingBottom: 20,
  },
  stepCard: {
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  stepAction: {
    marginTop: 8,
  },
  urlContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderRadius: spacing.borderRadius.button,
    borderWidth: 1,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace" as const,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginLeft: 8,
  },
  tipCard: {
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
    marginTop: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center" as const,
  },
  finishButton: {
    width: "100%",
    marginBottom: 12,
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
  finishText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  footerNote: {
    fontSize: 12,
    textAlign: "center" as const,
    lineHeight: 18,
  },
});
