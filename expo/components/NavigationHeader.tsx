import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ArrowLeft, Home } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavigationHeaderProps {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
}

export default function NavigationHeader({ title, onBack, onHome }: NavigationHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push("/");
    }
  };

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 60 : insets.top + 20 }]}>
      <TouchableOpacity 
        onPress={handleBack} 
        style={styles.navButton}
        accessible={true}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity 
        onPress={handleHome} 
        style={styles.navButton}
        accessible={true}
        accessibilityLabel="Go to home"
        accessibilityRole="button"
      >
        <Home size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  navButton: {
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
});
