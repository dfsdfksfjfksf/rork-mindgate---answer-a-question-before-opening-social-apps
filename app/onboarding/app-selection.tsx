import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ArrowLeft, ArrowRight, Smartphone } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useState } from "react";

const popularApps = [
  { name: "TikTok", icon: "🎵", description: "Short videos & entertainment" },
  { name: "Instagram", icon: "📸", description: "Photos & social sharing" },
  { name: "Snapchat", icon: "👻", description: "Messages & stories" },
  { name: "YouTube", icon: "📺", description: "Videos & tutorials" },
  { name: "Twitter", icon: "🐦", description: "News & social updates" },
  { name: "Facebook", icon: "👥", description: "Social networking" },
  { name: "Reddit", icon: "🤖", description: "Communities & discussions" },
  { name: "Discord", icon: "🎮", description: "Chat & gaming" },
];

export default function AppSelectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAppSelect = (appName: string) => {
    setSelectedApp(appName);
  };

  const handleContinue = () => {
    if (selectedApp) {
      router.push(`/onboarding/motivation?app=${encodeURIComponent(selectedApp)}` as any);
    }
  };

  const handleBack = () => {
    router.back();
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
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.titleSection}>
            <Smartphone size={48} color={colors.mint} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.text }]}>
              What app distracts you the most?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Choose the app you'd like to add a learning gate to
            </Text>
          </View>

          <ScrollView 
            style={styles.appsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.appsGrid}
          >
            {popularApps.map((app) => (
              <TouchableOpacity
                key={app.name}
                style={[
                  styles.appCard,
                  {
                    backgroundColor: selectedApp === app.name ? "rgba(68, 224, 201, 0.1)" : colors.glass,
                    borderColor: selectedApp === app.name ? colors.mint : colors.glassBorder,
                  }
                ]}
                onPress={() => handleAppSelect(app.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.appIcon}>{app.icon}</Text>
                <View style={styles.appInfo}>
                  <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                  <Text style={[styles.appDescription, { color: colors.textMuted }]}>
                    {app.description}
                  </Text>
                </View>
                {selectedApp === app.name && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.mint }]}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: selectedApp ? colors.mint : colors.glass,
                opacity: selectedApp ? 1 : 0.5,
              }
            ]}
            onPress={handleContinue}
            disabled={!selectedApp}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueText, { color: selectedApp ? "#fff" : colors.textMuted }]}>
              Continue
            </Text>
            <ArrowRight size={20} color={selectedApp ? "#fff" : colors.textMuted} />
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
  appsContainer: {
    flex: 1,
  },
  appsGrid: {
    gap: 12,
    paddingBottom: 20,
  },
  appCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 2,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  footer: {
    paddingVertical: 24,
  },
  continueButton: {
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
  },
});
