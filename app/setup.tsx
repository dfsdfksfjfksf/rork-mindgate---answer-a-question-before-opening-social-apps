import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from "react-native";
import { AlertTriangle, ExternalLink, Copy, CheckCircle2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/colors";
import { useLearnLock } from "@/contexts/MindGateContext";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const { appAssignments } = useLearnLock();
  const [copiedUrl, setCopiedUrl] = useState<string>("");

  const enabledAssignments = appAssignments.filter((a) => a.enabled);

  const handleCopyUrl = async (appName: string) => {
    const url = `https://rork.com/gate?app=${encodeURIComponent(appName)}`;
    await Clipboard.setStringAsync(url);
    setCopiedUrl(appName);
    setTimeout(() => setCopiedUrl(""), 2000);
  };

  const handleOpenShortcuts = async () => {
    const url = "shortcuts://";
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}>
        <View style={styles.headerCard}>
          <Text style={styles.headerText}>
            shortcuts will open LearnLock first when these apps launch
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Open the Shortcuts App</Text>
              <TouchableOpacity style={styles.actionButton} onPress={handleOpenShortcuts} activeOpacity={0.8}>
                <ExternalLink size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Open Shortcuts</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                At the bottom, select <Text style={styles.bold}>Automation</Text> and tap <Text style={styles.bold}>+</Text> to create a new personal automation
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Scroll to the bottom and select <Text style={styles.bold}>App</Text>
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Select <Text style={styles.bold}>Choose</Text> and pick the app you want LearnLock to gate
              </Text>
              <View style={styles.warningBox}>
                <AlertTriangle size={20} color={colors.peach} />
                <Text style={styles.warningText}>
                  <Text style={styles.bold}>Important:</Text> Only select 1 app. A separate automation is required for each app.
                </Text>
              </View>
              <Text style={styles.stepSubtitle}>
                Then tap <Text style={styles.bold}>Run immediately</Text> and turn <Text style={styles.bold}>Notify When Run</Text> OFF
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select <Text style={styles.bold}>Next</Text></Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Select <Text style={styles.bold}>+ New Blank Automation</Text>
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>7</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Search for <Text style={styles.bold}>Open URLs</Text> and select it
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>8</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Paste the URL for your app (see below)
              </Text>
              <View style={styles.warningBox}>
                <AlertTriangle size={20} color={colors.peach} />
                <Text style={styles.warningText}>
                  <Text style={styles.bold}>Important:</Text> The trigger app and the URL app must match. For example, if you chose Instagram in step 4, use the Instagram URL below.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>9</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Select <Text style={styles.bold}>Done</Text> in the upper right corner
              </Text>
            </View>
          </View>
        </View>

        {enabledAssignments.length > 0 && (
          <View style={styles.urlsSection}>
            <Text style={styles.urlsTitle}>Your App URLs</Text>
            <Text style={styles.urlsSubtitle}>Copy and paste these into the Open URLs action</Text>
            {enabledAssignments.map((assignment) => (
              <View key={assignment.id} style={styles.urlCard}>
                <View style={styles.urlHeader}>
                  <Text style={styles.urlAppName}>{assignment.appName}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyUrl(assignment.appName)}
                    activeOpacity={0.7}
                  >
                    {copiedUrl === assignment.appName ? (
                      <>
                        <CheckCircle2 size={16} color={colors.mint} />
                        <Text style={styles.copyButtonTextSuccess}>Copied!</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={16} color={colors.mint} />
                        <Text style={styles.copyButtonText}>Copy</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.urlText} numberOfLines={1}>
                  https://rork.com/gate?app={assignment.appName}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.finalCard}>
          <View style={styles.errorNotice}>
            <Text style={styles.errorNoticeText}>
              After using LearnLock, <Text style={styles.bold}>an error notification may pop up on your screen. You can ignore this error message—it&apos;s unavoidable but does not mean anything.</Text>
            </Text>
          </View>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Congrats! LearnLock is now ready to use!</Text>
            <Text style={styles.successSubtitle}>try opening the app you just set up LearnLock to gate</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    textAlign: "center" as const,
    lineHeight: 24,
  },
  stepsContainer: {
    gap: 24,
  },
  step: {
    flexDirection: "row" as const,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  stepSubtitle: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600" as const,
    color: colors.mint,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: colors.mint,
    borderRadius: spacing.borderRadius.button,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start" as const,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  warningBox: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    backgroundColor: "rgba(255, 198, 168, 0.1)",
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 198, 168, 0.2)",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  urlsSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  urlsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  urlsSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  urlCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  urlHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  urlAppName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  copyButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(68, 224, 201, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.chip,
    borderWidth: 1,
    borderColor: "rgba(68, 224, 201, 0.2)",
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  copyButtonTextSuccess: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  urlText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  finalCard: {
    marginTop: 24,
    gap: 16,
  },
  errorNotice: {
    backgroundColor: "rgba(255, 198, 168, 0.15)",
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 198, 168, 0.3)",
  },
  errorNoticeText: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 24,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center" as const,
  },
});
