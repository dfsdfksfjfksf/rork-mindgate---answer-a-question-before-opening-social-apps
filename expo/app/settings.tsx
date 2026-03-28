import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Switch } from "react-native";
import { useState, useEffect } from "react";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Save, Moon, Sun, HelpCircle, BarChart3 } from "lucide-react-native";
import { spacing } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLearnLock } from "@/contexts/MindGateContext";
import { useTheme } from "@/contexts/ThemeContext";

const SETTINGS_KEY = "learnlock_settings";

export interface AppSettings {
  defaultRequireStreak: number;
  defaultCooldownSeconds: number;
  applyToExisting: boolean;
  analyticsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultRequireStreak: 1,
  defaultCooldownSeconds: 5,
  applyToExisting: false,
  analyticsEnabled: false,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { appAssignments, updateAppAssignment } = useLearnLock();
  const { theme, colors, toggleTheme } = useTheme();
  const [requireStreak, setRequireStreak] = useState<string>("1");
  const [cooldownSeconds, setCooldownSeconds] = useState<string>("5");
  const [applyToExisting, setApplyToExisting] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
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
        setAnalyticsEnabled(settings.analyticsEnabled ?? false);
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
        analyticsEnabled,
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
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20, borderBottomColor: colors.glassBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>appearance</Text>
          <View style={[styles.settingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeaderInRow}>
                <View style={styles.themeIconRow}>
                  {theme === 'dark' ? (
                    <Moon size={20} color={colors.mint} />
                  ) : (
                    <Sun size={20} color={colors.mint} />
                  )}
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {theme === 'dark' ? 'dark mode' : 'light mode'}
                  </Text>
                </View>
                <Text style={[styles.settingHint, { color: colors.textMuted }]}>Toggle app appearance</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.glass, true: colors.mint }}
                thumbColor="#fff"
                ios_backgroundColor={colors.glass}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>default app settings</Text>
          <Text style={styles.sectionDescription}>
            These settings will be used as defaults when creating new app assignments
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.settingHeader}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>minimum correct answers</Text>
              <Text style={[styles.settingHint, { color: colors.textMuted }]}>How many questions to answer correctly</Text>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.glass, borderColor: colors.glassBorder, color: colors.text }]}
              value={requireStreak}
              onChangeText={setRequireStreak}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.settingHeader}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>retry wait time (seconds)</Text>
              <Text style={[styles.settingHint, { color: colors.textMuted }]}>Cooldown after wrong answer</Text>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.glass, borderColor: colors.glassBorder, color: colors.text }]}
              value={cooldownSeconds}
              onChangeText={setCooldownSeconds}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeaderInRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>apply to existing apps</Text>
                <Text style={[styles.settingHint, { color: colors.textMuted }]}>Update all current app assignments</Text>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>privacy</Text>
          <View style={[styles.settingCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingHeaderInRow}>
                <View style={styles.themeIconRow}>
                  <BarChart3 size={20} color={colors.lilac} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>analytics</Text>
                </View>
                <Text style={[styles.settingHint, { color: colors.textMuted }]}>Help improve the app (default: off)</Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
                trackColor={{ false: colors.glass, true: colors.mint }}
                thumbColor="#fff"
                ios_backgroundColor={colors.glass}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>support</Text>
          <TouchableOpacity
            style={[styles.supportCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            onPress={() => router.push('/support')}
            activeOpacity={0.7}
          >
            <View style={styles.supportRow}>
              <View style={styles.themeIconRow}>
                <HelpCircle size={20} color={colors.peach} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Support & Legal</Text>
              </View>
              <ArrowLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
            <Text style={[styles.settingHint, { color: colors.textMuted, marginTop: 4 }]}>
              Contact support, privacy policy, and terms
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.mint }, isSaving && styles.saveButtonDisabled]}
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
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
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
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  settingCard: {
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
  },
  input: {
    borderRadius: spacing.borderRadius.button,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    borderRadius: spacing.borderRadius.button,
    padding: 18,
    marginTop: 20,
  },
  themeIconRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  supportCard: {
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  supportRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
});
