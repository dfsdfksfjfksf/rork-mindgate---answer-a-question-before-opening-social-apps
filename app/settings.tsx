import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Switch } from "react-native";
import { useState, useEffect } from "react";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Save } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLearnLock } from "@/contexts/MindGateContext";

const SETTINGS_KEY = "learnlock_settings";

export interface AppSettings {
  defaultRequireStreak: number;
  defaultCooldownSeconds: number;
  applyToExisting: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultRequireStreak: 1,
  defaultCooldownSeconds: 5,
  applyToExisting: false,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { appAssignments, updateAppAssignment } = useLearnLock();
  const [requireStreak, setRequireStreak] = useState<string>("1");
  const [cooldownSeconds, setCooldownSeconds] = useState<string>("5");
  const [applyToExisting, setApplyToExisting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings: AppSettings = JSON.parse(stored);
        setRequireStreak(settings.defaultRequireStreak.toString());
        setCooldownSeconds(settings.defaultCooldownSeconds.toString());
        setApplyToExisting(settings.applyToExisting ?? false);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const streak = parseInt(requireStreak, 10);
      const cooldown = parseInt(cooldownSeconds, 10);

      if (isNaN(streak) || streak < 1) {
        alert("Minimum correct answers must be at least 1");
        setIsSaving(false);
        return;
      }

      if (isNaN(cooldown) || cooldown < 0) {
        alert("Wait time must be 0 or greater");
        setIsSaving(false);
        return;
      }

      const settings: AppSettings = {
        defaultRequireStreak: streak,
        defaultCooldownSeconds: cooldown,
        applyToExisting,
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      if (applyToExisting) {
        console.log("Applying settings to all existing app assignments...");
        for (const assignment of appAssignments) {
          await updateAppAssignment(assignment.id, {
            requireStreak: streak,
            cooldownSeconds: cooldown,
          });
        }
        console.log("Updated", appAssignments.length, "app assignments");
      }
      
      setTimeout(() => {
        setIsSaving(false);
        router.back();
      }, 500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>default app settings</Text>
          <Text style={styles.sectionDescription}>
            These settings will be used as defaults when creating new app assignments
          </Text>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>minimum correct answers</Text>
              <Text style={styles.settingHint}>How many questions to answer correctly</Text>
            </View>
            <TextInput
              style={styles.input}
              value={requireStreak}
              onChangeText={setRequireStreak}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>retry wait time (seconds)</Text>
              <Text style={styles.settingHint}>Cooldown after wrong answer</Text>
            </View>
            <TextInput
              style={styles.input}
              value={cooldownSeconds}
              onChangeText={setCooldownSeconds}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeaderInRow}>
                <Text style={styles.settingLabel}>apply to existing apps</Text>
                <Text style={styles.settingHint}>Update all current app assignments</Text>
              </View>
              <Switch
                value={applyToExisting}
                onValueChange={setApplyToExisting}
                trackColor={{ false: colors.glass, true: colors.mint }}
                thumbColor="#fff"
                ios_backgroundColor={colors.glass}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveSettings}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>{isSaving ? "saving..." : "save settings"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  settingHeader: {
    marginBottom: 12,
  },
  settingHeaderInRow: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: spacing.borderRadius.button,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  saveButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    backgroundColor: colors.mint,
    borderRadius: spacing.borderRadius.button,
    padding: 18,
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
