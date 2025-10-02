import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { useState } from "react";
import { Plus, Trash2, ExternalLink, Smartphone } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { colors, spacing } from "@/constants/colors";
import { router } from "expo-router";
import { getDefaultAppConfig } from "@/constants/defaultApps";

export default function AppsScreen() {
  const { appAssignments, quizSets, addAppAssignment, updateAppAssignment, deleteAppAssignment } = useLearnLock();
  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [appName, setAppName] = useState<string>("");
  const [selectedQuizSetId, setSelectedQuizSetId] = useState<string>("");
  const [schemeOrStoreURL, setSchemeOrStoreURL] = useState<string>("");
  const [randomize, setRandomize] = useState<boolean>(true);
  const [requireStreak, setRequireStreak] = useState<string>("1");
  const [cooldownSeconds, setCooldownSeconds] = useState<string>("0");

  const resetForm = () => {
    setAppName("");
    setSelectedQuizSetId("");
    setSchemeOrStoreURL("");
    setRandomize(true);
    setRequireStreak("1");
    setCooldownSeconds("0");
    setShowNewForm(false);
  };

  const handleCreate = async () => {
    if (!appName.trim()) {
      Alert.alert("Error", "App name is required");
      return;
    }

    if (!selectedQuizSetId) {
      Alert.alert("Error", "Please select a quiz set");
      return;
    }

    const streakNum = parseInt(requireStreak, 10);
    const cooldownNum = parseInt(cooldownSeconds, 10);

    if (isNaN(streakNum) || streakNum < 1) {
      Alert.alert("Error", "Streak must be at least 1");
      return;
    }

    if (isNaN(cooldownNum) || cooldownNum < 0) {
      Alert.alert("Error", "Cooldown must be 0 or greater");
      return;
    }

    // Get default config if available
    const defaultConfig = getDefaultAppConfig(appName.trim());
    
    await addAppAssignment({
      appName: appName.trim(),
      quizSetId: selectedQuizSetId,
      schemeOrStoreURL: schemeOrStoreURL.trim() || defaultConfig?.schemeOrStoreURL,
      openUrl: defaultConfig?.openUrl,
      randomize,
      requireStreak: streakNum,
      cooldownSeconds: cooldownNum,
      enabled: false,
      setupCompleted: false,
    });

    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Assignment", `Are you sure you want to delete the assignment for "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAppAssignment(id),
      },
    ]);
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    await updateAppAssignment(id, { enabled: !currentEnabled });
  };

  const handleTestGate = (appName: string) => {
    router.push(`/gate?app=${encodeURIComponent(appName)}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Test Section */}
        <View style={styles.quickTestSection}>
          <Text style={styles.quickTestTitle}>Quick Test</Text>
          <TouchableOpacity
            style={styles.instagramTestButton}
            onPress={() => handleTestGate('Instagram')}
            activeOpacity={0.8}
          >
            <Smartphone size={20} color="#fff" />
            <Text style={styles.instagramTestButtonText}>Test Gate for Instagram</Text>
          </TouchableOpacity>
        </View>

        {appAssignments.map((assignment) => {
          const quizSet = quizSets.find((q) => q.id === assignment.quizSetId);
          return (
            <View key={assignment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{assignment.appName}</Text>
                  <Switch
                    value={assignment.enabled}
                    onValueChange={() => handleToggleEnabled(assignment.id, assignment.enabled)}
                    trackColor={{ false: colors.glass, true: colors.mint }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.cardMeta}>Quiz: {quizSet?.name || "Unknown"}</Text>
                <Text style={styles.cardMeta}>
                  Streak: {assignment.requireStreak} | Cooldown: {assignment.cooldownSeconds}s
                </Text>
                {(assignment.openUrl || assignment.schemeOrStoreURL) && (
                  <Text style={styles.cardUrl} numberOfLines={1}>
                    {assignment.openUrl || assignment.schemeOrStoreURL}
                  </Text>
                )}
                {!assignment.openUrl && !assignment.schemeOrStoreURL && (
                  <Text style={styles.noUrlText}>
                    No URL set - add one to enable app opening
                  </Text>
                )}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => handleTestGate(assignment.appName)}
                >
                  <ExternalLink size={18} color="#14b8a6" />
                  <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(assignment.id, assignment.appName)}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {showNewForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>New App Assignment</Text>
            
            <TextInput
              style={styles.input}
              placeholder="App Name (e.g., Instagram)"
              placeholderTextColor="#64748b"
              value={appName}
              onChangeText={setAppName}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Quiz Set</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quizPicker}>
                {quizSets.map((quizSet) => (
                  <TouchableOpacity
                    key={quizSet.id}
                    style={[
                      styles.quizOption,
                      selectedQuizSetId === quizSet.id && styles.quizOptionSelected,
                    ]}
                    onPress={() => setSelectedQuizSetId(quizSet.id)}
                  >
                    <Text
                      style={[
                        styles.quizOptionText,
                        selectedQuizSetId === quizSet.id && styles.quizOptionTextSelected,
                      ]}
                    >
                      {quizSet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={styles.input}
              placeholder="App Scheme/URL (e.g., instagram://)"
              placeholderTextColor="#64748b"
              value={schemeOrStoreURL}
              onChangeText={setSchemeOrStoreURL}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Randomize Questions</Text>
              <Switch
                value={randomize}
                onValueChange={setRandomize}
                trackColor={{ false: colors.glass, true: colors.mint }}
                thumbColor="#fff"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Required Streak (default: 1)"
              placeholderTextColor="#64748b"
              value={requireStreak}
              onChangeText={setRequireStreak}
              keyboardType="number-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Cooldown Seconds (default: 0)"
              placeholderTextColor="#64748b"
              value={cooldownSeconds}
              onChangeText={setCooldownSeconds}
              keyboardType="number-pad"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreate}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!showNewForm && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowNewForm(true)}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
  },
  cardMeta: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardUrl: {
    fontSize: 12,
    color: colors.mint,
    marginTop: 4,
  },
  noUrlText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  quickTestSection: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickTestTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  instagramTestButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: colors.peach,
    borderRadius: spacing.borderRadius.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center" as const,
  },
  instagramTestButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  cardActions: {
    flexDirection: "row" as const,
    gap: 12,
    alignItems: "center" as const,
  },
  testButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#14b8a6",
  },
  testButtonText: {
    color: "#14b8a6",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  quizPicker: {
    flexDirection: "row" as const,
  },
  quizOption: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: spacing.borderRadius.button,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quizOptionSelected: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  quizOptionText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600" as const,
  },
  quizOptionTextSelected: {
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
  },
  formButtons: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  cancelButton: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  createButton: {
    backgroundColor: colors.mint,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  fab: {
    position: "absolute" as const,
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.mint,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: spacing.shadow.y },
    shadowOpacity: 1,
    shadowRadius: spacing.shadow.blur,
  },
});
