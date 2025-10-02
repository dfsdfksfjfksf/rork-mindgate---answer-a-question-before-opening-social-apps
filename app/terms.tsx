import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Stack } from "expo-router";
import { FileText } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import NavigationHeader from "@/components/NavigationHeader";

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FileText size={48} color={colors.lilac} />
          <Text style={styles.title}>Terms of Service & EULA</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>End User License Agreement</Text>
          <Text style={styles.paragraph}>
            By downloading and using LearnLock, you agree to these terms and conditions. This agreement grants you a non-exclusive license to use the app on your personal devices.
          </Text>

          <Text style={styles.sectionTitle}>Permitted Use</Text>
          <Text style={styles.paragraph}>
            You may use LearnLock for personal, educational purposes. The app is designed to help you build better digital habits through learning prompts.
          </Text>

          <Text style={styles.sectionTitle}>Restrictions</Text>
          <Text style={styles.paragraph}>
            You may not:
          </Text>
          <Text style={styles.listItem}>• Reverse engineer or decompile the app</Text>
          <Text style={styles.listItem}>• Distribute or resell the app</Text>
          <Text style={styles.listItem}>• Use the app for commercial purposes without permission</Text>
          <Text style={styles.listItem}>• Attempt to circumvent any security features</Text>

          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            LearnLock and all related content are owned by Rork. The app name, design, and functionality are protected by copyright and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <Text style={styles.paragraph}>
            LearnLock is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or always available. Use the app at your own risk.
          </Text>

          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall Rork be liable for any indirect, incidental, special, or consequential damages arising from your use of LearnLock.
          </Text>

          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.paragraph}>
            This license is effective until terminated. Your rights under this license will terminate automatically if you fail to comply with any of these terms.
          </Text>

          <Text style={styles.sectionTitle}>Updates</Text>
          <Text style={styles.paragraph}>
            We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>
            For questions about these terms, contact us at legal@rork.com.
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
    fontSize: 24,
    fontWeight: "600" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
});


