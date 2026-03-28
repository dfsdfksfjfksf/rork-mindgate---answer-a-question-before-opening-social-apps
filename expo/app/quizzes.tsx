import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { colors, spacing } from "@/constants/colors";
import { router } from "expo-router";

export default function QuizzesScreen() {
  const { quizSets, addQuizSet, deleteQuizSet, getQuestionsForQuizSet } = useLearnLock();
  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newTopic, setNewTopic] = useState<string>("");
  const [newDifficulty, setNewDifficulty] = useState<string>("");

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Quiz set name is required");
      return;
    }

    await addQuizSet({
      name: newName.trim(),
      topic: newTopic.trim() || undefined,
      difficulty: newDifficulty.trim() || undefined,
    });

    setNewName("");
    setNewTopic("");
    setNewDifficulty("");
    setShowNewForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Quiz Set",
      `Are you sure you want to delete "${name}"? This will also delete all questions in this set.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteQuizSet(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {quizSets.map((quizSet) => {
          const questionCount = getQuestionsForQuizSet(quizSet.id).length;
          return (
            <TouchableOpacity
              key={quizSet.id}
              style={styles.card}
              onPress={() => router.push(`/quiz-editor?id=${quizSet.id}`)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{quizSet.name}</Text>
                  <ChevronRight size={20} color="#94a3b8" />
                </View>
                {quizSet.topic && (
                  <Text style={styles.cardMeta}>Topic: {quizSet.topic}</Text>
                )}
                {quizSet.difficulty && (
                  <Text style={styles.cardMeta}>Difficulty: {quizSet.difficulty}</Text>
                )}
                <Text style={styles.cardCount}>{questionCount} questions</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(quizSet.id, quizSet.name)}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {showNewForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>New Quiz Set</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (required)"
              placeholderTextColor="#64748b"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Topic (optional)"
              placeholderTextColor="#64748b"
              value={newTopic}
              onChangeText={setNewTopic}
            />
            <TextInput
              style={styles.input}
              placeholder="Difficulty (optional)"
              placeholderTextColor="#64748b"
              value={newDifficulty}
              onChangeText={setNewDifficulty}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowNewForm(false);
                  setNewName("");
                  setNewTopic("");
                  setNewDifficulty("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!showNewForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowNewForm(true)}
        >
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: colors.mint,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
