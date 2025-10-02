import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LearnLockProvider } from "@/contexts/MindGateContext";
import { TouchableOpacity } from "react-native";
import { Home } from "lucide-react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const HomeButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/")}
      style={{ marginRight: 16 }}
    >
      <Home size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#0B0F14",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700" as const,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="quizzes" 
        options={{ 
          title: "Quiz Sets",
          headerRight: () => <HomeButton />,
        }} 
      />
      <Stack.Screen 
        name="quiz-editor" 
        options={{ 
          title: "Edit Quiz",
          headerRight: () => <HomeButton />,
        }} 
      />
      <Stack.Screen 
        name="apps" 
        options={{ 
          title: "App Assignments",
          headerRight: () => <HomeButton />,
        }} 
      />
      <Stack.Screen 
        name="setup" 
        options={{ 
          title: "iOS Setup",
          headerRight: () => <HomeButton />,
        }} 
      />
      <Stack.Screen name="gate" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LearnLockProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </LearnLockProvider>
    </QueryClientProvider>
  );
}
