import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ArrowRight, Brain, Globe, Atom, Calculator, Palette, Plus } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { spacing } from "@/constants/colors";
import { useEffect, useRef, useState } from "react";

const topics = [
  { id: "general", name: "General Knowledge", icon: Globe, color: "#44E0C9", description: "History, geography, culture" },
  { id: "science", name: "Science", icon: Atom, color: "#B794F6", description: "Physics, chemistry, biology" },
  { id: "math", name: "Mathematics", icon: Calculator, color: "#F093A0", description: "Numbers, equations, logic" },
  { id: "arts", name: "Arts & Culture", icon: Palette, color: "#FFB84D", description: "Literature, music, art history" },
  { id: "technology", name: "Technology", icon: Brain, color: "#4ECDC4", description: "Programming, AI, innovation" },
];

export default function TopicSelectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { app } = useLocalSearchParams<{ app: string }>();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleContinue = () => {
    if (selectedTopic) {
      router.push(`/onboarding/tutorial?app=${encodeURIComponent(app || '')}&topic=${selectedTopic}` as any);
    }
  };

  const handleCreateCustom = () => {
    router.push(`/onboarding/tutorial?app=${encodeURIComponent(app || '')}&topic=custom` as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.background, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.mint }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.glass }]} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.titleSection}>
            <Brain size={48} color={colors.mint} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.text }]}>
              What do you want to improve on?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Choose a topic for your learning questions
            </Text>
          </View>

          <ScrollView 
            style={styles.topicsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.topicsGrid}
          >
            {topics.map((topic) => {
              const IconComponent = topic.icon;
              const isSelected = selectedTopic === topic.id;
              
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicCard,
                    {
                      backgroundColor: isSelected ? `${topic.color}20` : colors.glass,
                      borderColor: isSelected ? topic.color : colors.glassBorder,
                    }
                  ]}
                  onPress={() => handleTopicSelect(topic.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.topicIcon, { backgroundColor: `${topic.color}20` }]}>
                    <IconComponent size={24} color={topic.color} />
                  </View>
                  <View style={styles.topicInfo}>
                    <Text style={[styles.topicName, { color: colors.text }]}>{topic.name}</Text>
                    <Text style={[styles.topicDescription, { color: colors.textMuted }]}>
                      {topic.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: topic.color }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Custom Option */}
            <TouchableOpacity
              style={[
                styles.customCard,
                { backgroundColor: colors.glass, borderColor: colors.glassBorder }
              ]}
              onPress={handleCreateCustom}
              activeOpacity={0.8}
            >
              <View style={[styles.customIcon, { backgroundColor: colors.glass }]}>
                <Plus size={24} color={colors.mint} />
              </View>
              <View style={styles.topicInfo}>
                <Text style={[styles.topicName, { color: colors.text }]}>Create Your Own</Text>
                <Text style={[styles.topicDescription, { color: colors.textMuted }]}>
                  Build a custom quiz on any topic
                </Text>
              </View>
              <ArrowRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: selectedTopic ? colors.mint : colors.glass,
                opacity: selectedTopic ? 1 : 0.5,
              }
            ]}
            onPress={handleContinue}
            disabled={!selectedTopic}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueText, { color: selectedTopic ? "#fff" : colors.textMuted }]}>
              Continue
            </Text>
            <ArrowRight size={20} color={selectedTopic ? "#fff" : colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
  },
  progressContainer: {
    flexDirection: "row" as const,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center" as const,
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  topicsContainer: {
    flex: 1,
  },
  topicsGrid: {
    gap: 12,
    paddingBottom: 20,
  },
  topicCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 2,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  customCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: spacing.borderRadius.card,
    borderWidth: 1,
    borderStyle: "dashed" as const,
  },
  customIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(68, 224, 201, 0.3)",
    borderStyle: "dashed" as const,
  },
  footer: {
    paddingVertical: 24,
  },
  continueButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: spacing.borderRadius.button,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
});
