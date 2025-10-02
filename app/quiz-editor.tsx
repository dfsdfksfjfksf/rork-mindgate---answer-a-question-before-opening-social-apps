import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { Plus, Trash2, Check } from "lucide-react-native";
import { useLearnLock } from "@/contexts/MindGateContext";
import { colors, spacing } from "@/constants/colors";
import type { QuestionType } from "@/types";

export default function QuizEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quizSets, addQuestion, deleteQuestion, getQuestionsForQuizSet } = useLearnLock();
  
  const quizSet = quizSets.find((q) => q.id === id);
  const quizQuestions = getQuestionsForQuizSet(id || "");

  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [prompt, setPrompt] = useState<string>("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [acceptableAnswers, setAcceptableAnswers] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  const resetForm = () => {
    setPrompt("");
    setChoices(["", "", "", ""]);
    setCorrectIndex(0);
    setAcceptableAnswers("");
    setExplanation("");
    setShowNewForm(false);
  };

  const handleCreate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Question prompt is required");
      return;
    }

    if (questionType === "mcq") {
      const filledChoices = choices.filter((c) => c.trim());
      if (filledChoices.length < 2) {
        Alert.alert("Error", "At least 2 choices are required for MCQ");
        return;
      }

      await addQuestion({
        quizSetId: id || "",
        type: "mcq",
        prompt: prompt.trim(),
        choices: filledChoices,
        correctAnswer: filledChoices[correctIndex],
        explanation: explanation.trim() || undefined,
      });
    } else {
      const answers = acceptableAnswers
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      
      if (answers.length === 0) {
        Alert.alert("Error", "At least one acceptable answer is required");
        return;
      }

      await addQuestion({
        quizSetId: id || "",
        type: "short_answer",
        prompt: prompt.trim(),
        acceptableAnswers: answers,
        explanation: explanation.trim() || undefined,
      });
    }

    resetForm();
  };

  const handleDelete = (questionId: string) => {
    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteQuestion(questionId),
      },
    ]);
  };

  if (!quizSet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Quiz set not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: quizSet.name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {quizQuestions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Q{index + 1}</Text>
              <TouchableOpacity onPress={() => handleDelete(question.id)}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.questionPrompt}>{question.prompt}</Text>
            {question.type === "mcq" && question.choices && (
              <View style={styles.choicesContainer}>
                {question.choices.map((choice, i) => (
                  <View
                    key={i}
                    style={[
                      styles.choice,
                      choice === question.correctAnswer && styles.correctChoice,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        choice === question.correctAnswer && styles.correctChoiceText,
                      ]}
                    >
                      {choice}
                    </Text>
                    {choice === question.correctAnswer && (
                      <Check size={16} color="#14b8a6" />
                    )}
                  </View>
                ))}
              </View>
            )}
            {question.type === "short_answer" && question.acceptableAnswers && (
              <View style={styles.answersContainer}>
                <Text style={styles.answersLabel}>Acceptable answers:</Text>
                <Text style={styles.answersText}>
                  {question.acceptableAnswers.join(", ")}
                </Text>
              </View>
            )}
            {question.explanation && (
              <Text style={styles.explanation}>💡 {question.explanation}</Text>
            )}
          </View>
        ))}

        {showNewForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>New Question</Text>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, questionType === "mcq" && styles.typeButtonActive]}
                onPress={() => setQuestionType("mcq")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    questionType === "mcq" && styles.typeButtonTextActive,
                  ]}
                >
                  Multiple Choice
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  questionType === "short_answer" && styles.typeButtonActive,
                ]}
                onPress={() => setQuestionType("short_answer")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    questionType === "short_answer" && styles.typeButtonTextActive,
                  ]}
                >
                  Short Answer
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Question prompt"
              placeholderTextColor="#64748b"
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />

            {questionType === "mcq" ? (
              <>
                {choices.map((choice, i) => (
                  <View key={i} style={styles.choiceInput}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder={`Choice ${i + 1}`}
                      placeholderTextColor="#64748b"
                      value={choice}
                      onChangeText={(text) => {
                        const newChoices = [...choices];
                        newChoices[i] = text;
                        setChoices(newChoices);
                      }}
                    />
                    <TouchableOpacity
                      style={[
                        styles.correctButton,
                        correctIndex === i && styles.correctButtonActive,
                      ]}
                      onPress={() => setCorrectIndex(i)}
                    >
                      <Check
                        size={20}
                        color={correctIndex === i ? "#fff" : "#64748b"}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Acceptable answers (comma-separated)"
                placeholderTextColor="#64748b"
                value={acceptableAnswers}
                onChangeText={setAcceptableAnswers}
              />
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Explanation (optional)"
              placeholderTextColor="#64748b"
              value={explanation}
              onChangeText={setExplanation}
              multiline
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
              >
                <Text style={styles.createButtonText}>Add Question</Text>
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
  errorText: {
    color: colors.peach,
    fontSize: 16,
    textAlign: "center" as const,
    marginTop: 40,
  },
  questionCard: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  questionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.mint,
  },
  questionPrompt: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  choicesContainer: {
    gap: 8,
  },
  choice: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: spacing.borderRadius.button,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  correctChoice: {
    borderColor: colors.mint,
    backgroundColor: "rgba(68, 224, 201, 0.1)",
  },
  choiceText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  correctChoiceText: {
    color: colors.mint,
    fontWeight: "600" as const,
  },
  answersContainer: {
    marginTop: 8,
  },
  answersLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  answersText: {
    fontSize: 14,
    color: colors.mint,
  },
  explanation: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
    fontStyle: "italic" as const,
    lineHeight: 20,
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
  typeSelector: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: spacing.borderRadius.button,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
  },
  typeButtonActive: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  typeButtonText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600" as const,
  },
  typeButtonTextActive: {
    color: "#fff",
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  choiceInput: {
    flexDirection: "row" as const,
    gap: 8,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.button,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  correctButtonActive: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
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
