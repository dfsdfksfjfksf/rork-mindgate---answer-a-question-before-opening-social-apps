import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Stack } from "expo-router";
import { Shield } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import NavigationHeader from "@/components/NavigationHeader";

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader title="Privacy Policy" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Shield size={48} color={colors.mint} />
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          <Text style={styles.paragraph}>
            LearnLock is designed with privacy in mind. All your data is stored locally on your device, including:
          </Text>
          <Text style={styles.listItem}>• Quiz questions and answers</Text>
          <Text style={styles.listItem}>• App assignments and settings</Text>
          <Text style={styles.listItem}>• Your learning progress and statistics</Text>
          
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not share, sell, or transmit your personal data to third parties. Your information never leaves your device unless you explicitly choose to back it up through your device's cloud services.
          </Text>

          <Text style={styles.sectionTitle}>Analytics</Text>
          <Text style={styles.paragraph}>
            Analytics tracking is disabled by default. You can enable optional, anonymous usage analytics in Settings to help us improve the app. No personal data is collected even when analytics are enabled.
          </Text>

          <Text style={styles.sectionTitle}>App Permissions</Text>
          <Text style={styles.paragraph}>
            LearnLock may request the following permissions:
          </Text>
          <Text style={styles.listItem}>• URL opening: To redirect you to social apps after completing questions</Text>
          <Text style={styles.listItem}>• Notifications: To remind you of learning goals (optional)</Text>

          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            Your data is encrypted and stored securely on your device using industry-standard security practices. We recommend keeping your device updated and secured with a passcode.
          </Text>

          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            LearnLock is suitable for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent.
          </Text>

          <Text style={styles.sectionTitle}>Changes to Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy within the app.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this privacy policy, please contact us at support@rork.com.
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
  contentHeader: {
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


