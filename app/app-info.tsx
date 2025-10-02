import { View, Text, StyleSheet, ScrollView, Platform, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Stack } from "expo-router";
import { Info, Image, Smartphone, Save } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import Constants from "expo-constants";
import NavigationHeader from "@/components/NavigationHeader";

export default function AppInfoScreen() {
  const [marketingVersion, setMarketingVersion] = useState("1.0.0");

  const screenshotRequirements = [
    "6.7″ iPhone Pro Max (1290 x 2796 px)",
    "6.5″ iPhone Plus (1242 x 2688 px)",
    "5.5″ iPhone (1242 x 2208 px)",
    "iPad Pro 3rd Gen (2048 x 2732 px)",
    "iPad Pro 2nd Gen (2048 x 2732 px)"
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader title="App Information" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Info size={48} color={colors.mint} />
          <Text style={styles.title}>App Information</Text>
          <Text style={styles.subtitle}>Metadata and asset helpers for App Store submission</Text>
        </View>

        {/* App Icon Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Icon</Text>
          <View style={styles.iconPreview}>
            <View style={styles.iconPlaceholder}>
              <Image size={32} color={colors.textMuted} />
            </View>
            <View style={styles.iconInfo}>
              <Text style={styles.iconTitle}>LearnLock Icon</Text>
              <Text style={styles.iconSubtitle}>1024×1024px required for App Store</Text>
              <Text style={styles.iconPath}>Located in: assets/images/icon.png</Text>
            </View>
          </View>
        </View>

        {/* Marketing Version */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version Information</Text>
          <View style={styles.versionCard}>
            <Text style={styles.label}>Marketing Version</Text>
            <TextInput
              style={styles.input}
              value={marketingVersion}
              onChangeText={setMarketingVersion}
              placeholder="1.0.0"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.hint}>This is the version users see in the App Store</Text>
            
            <Text style={styles.label}>Build Version</Text>
            <Text style={styles.readOnlyValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
            <Text style={styles.hint}>Automatically managed by Expo</Text>
          </View>
        </View>

        {/* Screenshot Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Screenshot Requirements</Text>
          <View style={styles.screenshotCard}>
            <View style={styles.screenshotHeader}>
              <Smartphone size={24} color={colors.lilac} />
              <Text style={styles.screenshotTitle}>Required Screenshot Sizes</Text>
            </View>
            <Text style={styles.screenshotSubtitle}>
              You need screenshots for these device sizes to submit to the App Store:
            </Text>
            <View style={styles.requirementsList}>
              {screenshotRequirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.requirementBullet} />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>
            <View style={styles.screenshotTips}>
              <Text style={styles.tipsTitle}>💡 Tips:</Text>
              <Text style={styles.tipsText}>• Use iOS Simulator to capture precise screenshot sizes</Text>
              <Text style={styles.tipsText}>• Show your app's key features clearly</Text>
              <Text style={styles.tipsText}>• Include 3-10 screenshots per device size</Text>
              <Text style={styles.tipsText}>• Avoid using device frames in the screenshots</Text>
            </View>
          </View>
        </View>

        {/* App Information Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current App Details</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryItem}>Bundle ID: {Constants.expoConfig?.ios?.bundleIdentifier || 'Not set'}</Text>
            <Text style={styles.summaryItem}>Scheme: {Constants.expoConfig?.scheme || 'Not set'}</Text>
            <Text style={styles.summaryItem}>Platform: iOS (iPhone & iPad)</Text>
            <Text style={styles.summaryItem}>Minimum iOS: 11.0</Text>
            <Text style={styles.summaryItem}>Orientation: Portrait</Text>
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 16,
  },
  iconPreview: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  iconInfo: {
    flex: 1,
  },
  iconTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  iconSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  iconPath: {
    fontSize: 12,
    color: colors.mint,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  versionCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  readOnlyValue: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    color: colors.textMuted,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  screenshotCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  screenshotHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  screenshotTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginLeft: 8,
  },
  screenshotSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  requirementsList: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  requirementBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lilac,
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  screenshotTips: {
    backgroundColor: "rgba(183, 148, 246, 0.1)",
    borderRadius: spacing.borderRadius.button,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(183, 148, 246, 0.2)",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  summaryItem: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});

