import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Stack } from "expo-router";
import { HelpCircle } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import NavigationHeader from "@/components/NavigationHeader";

export default function FAQScreen() {
  const insets = useSafeAreaInsets();

  const faqs = [
    {
      question: "How does LearnLock work?",
      answer: "LearnLock shows you educational questions before you can access social media apps. You must answer correctly to unlock the app, encouraging mindful usage and learning."
    },
    {
      question: "How do I set up app blocking?",
      answer: "Use the iOS Shortcuts app to create a Personal Automation. When your target app opens, it will redirect to LearnLock first. Follow the step-by-step guide in the Setup section."
    },
    {
      question: "Can I customize the questions?",
      answer: "Yes! Create custom quiz sets in the Quizzes section. You can add multiple choice or short answer questions on any topic you want to learn."
    },
    {
      question: "What happens if I get a question wrong?",
      answer: "You'll see the correct answer and explanation (if provided). Depending on your settings, you may need to wait a few seconds before trying again."
    },
    {
      question: "Is my data private?",
      answer: "Absolutely. All your data is stored locally on your device. We don't collect, share, or transmit any personal information. Analytics are disabled by default."
    },
    {
      question: "Can I use this on Android?",
      answer: "LearnLock is currently designed for iOS devices with the Shortcuts app. Android support may be added in future versions."
    },
    {
      question: "Why do I see an error after using LearnLock?",
      answer: "iOS may show a brief error notification after the automation runs. This is normal and harmless - you can safely ignore it. The app will still work correctly."
    },
    {
      question: "Can I bypass LearnLock?",
      answer: "Yes, you can disable the automation in Settings > Shortcuts at any time. LearnLock is designed to help build better habits, not to be a strict parental control."
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HelpCircle size={48} color={colors.lilac} />
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>Common questions about LearnLock</Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
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
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center" as const,
  },
  faqList: {
    gap: 20,
  },
  faqItem: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  question: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});

