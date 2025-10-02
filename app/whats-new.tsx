import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Stack } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WhatsNewScreen() {
  const insets = useSafeAreaInsets();

  const updates = [
    {
      version: "1.0.0",
      date: "January 2025",
      features: [
        "🎉 Initial release of LearnLock",
        "📚 Create custom quiz sets with multiple choice and short answer questions",
        "📱 iOS Shortcuts integration for app blocking",
        "🎯 Customizable streak requirements and cooldown periods",
        "🌙 Beautiful dark mode interface",
        "🔒 Complete privacy - all data stored locally",
        "⚡ Preview Gate for instant testing",
        "📊 Daily statistics and progress tracking"
      ]
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Sparkles size={48} color={colors.peach} />
          <Text style={styles.title}>What's New</Text>
          <Text style={styles.subtitle}>Latest features and improvements</Text>
        </View>

        <View style={styles.updatesList}>
          {updates.map((update, index) => (
            <View key={index} style={styles.updateItem}>
              <View style={styles.updateHeader}>
                <Text style={styles.version}>Version {update.version}</Text>
                <Text style={styles.date}>{update.date}</Text>
              </View>
              <View style={styles.featuresList}>
                {update.features.map((feature, featureIndex) => (
                  <Text key={featureIndex} style={styles.feature}>
                    {feature}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for using LearnLock! We're constantly working to improve your learning experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center" as const,
  },
  updatesList: {
    gap: 24,
  },
  updateItem: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  updateHeader: {
    marginBottom: 16,
  },
  version: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
  },
  featuresList: {
    gap: 8,
  },
  feature: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: 16,
  },
  footerText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center" as const,
    lineHeight: 22,
  },
});

