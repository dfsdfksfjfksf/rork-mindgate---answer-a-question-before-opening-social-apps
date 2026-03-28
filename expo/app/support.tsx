import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from "react-native";
import { Stack } from "expo-router";
import { Mail, HelpCircle, Sparkles, Shield, FileText, Info, Smartphone } from "lucide-react-native";
import { colors, spacing } from "@/constants/colors";
import { router } from "expo-router";
import Constants from "expo-constants";
import NavigationHeader from "@/components/NavigationHeader";

export default function SupportScreen() {

  const handleContactSupport = () => {
    const email = "support@rork.com";
    const subject = "LearnLock Support Request";
    const body = `Hi,\n\nI need help with LearnLock.\n\nApp Version: ${Constants.expoConfig?.version || '1.0.0'}\nPlatform: ${Platform.OS}\n\nDescription:\n`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoUrl);
  };

  const supportItems = [
    {
      icon: Mail,
      title: "Contact Support",
      subtitle: "Get help from our team",
      onPress: handleContactSupport,
      color: colors.mint,
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      subtitle: "Common questions and answers",
      onPress: () => router.push("/faq"),
      color: colors.lilac,
    },
    {
      icon: Sparkles,
      title: "What's New",
      subtitle: "Latest features and updates",
      onPress: () => router.push("/whats-new"),
      color: colors.peach,
    },
    {
      icon: Smartphone,
      title: "App Information",
      subtitle: "Metadata and App Store helpers",
      onPress: () => router.push("/app-info"),
      color: colors.mint,
    },
  ];

  const legalItems = [
    {
      icon: Shield,
      title: "Privacy Policy",
      subtitle: "How we protect your data",
      onPress: () => router.push("/privacy-policy"),
      color: colors.mint,
    },
    {
      icon: FileText,
      title: "Terms & EULA",
      subtitle: "Terms of service and license",
      onPress: () => router.push("/terms"),
      color: colors.lilac,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <NavigationHeader title="Support & Legal" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Info size={48} color={colors.mint} />
          <Text style={styles.title}>Support & Legal</Text>
          <Text style={styles.subtitle}>Get help and review our policies</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={item.onPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={`${item.title}: ${item.subtitle}`}
              accessibilityRole="button"
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <item.icon size={24} color={item.color} strokeWidth={2} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {legalItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={item.onPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={`${item.title}: ${item.subtitle}`}
              accessibilityRole="button"
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <item.icon size={24} color={item.color} strokeWidth={2} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <Text style={styles.appInfoText}>Version: {Constants.expoConfig?.version || '1.0.0'}</Text>
          <Text style={styles.appInfoText}>Build: {typeof Constants.expoConfig?.runtimeVersion === 'string' ? Constants.expoConfig.runtimeVersion : 'development'}</Text>
          <Text style={styles.appInfoText}>Platform: {Platform.OS}</Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  item: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    minHeight: 70,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  appInfo: {
    backgroundColor: colors.glass,
    borderRadius: spacing.borderRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center" as const,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
});
