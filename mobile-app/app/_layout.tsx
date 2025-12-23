import { useEffect } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { TractorProvider, useTractors } from "@/context/TractorContext";

function InitialLayout() {
  const { isLoggedIn, loading } = useTractors();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === "login";

    if (!isLoggedIn && !inAuthGroup) {
      // 🔒 No token and not on login? Go to login
      router.replace("/login");
    } else if (isLoggedIn && inAuthGroup) {
      // ✅ Logged in and on login? Go to Home (Root Index)
      router.replace("/");
    }
  }, [isLoggedIn, loading, segments, navigationState?.key]);

  // Global loading screen while checking auth
  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7fa" }}>
        <ActivityIndicator size="large" color="#064e3b" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="tractor/[id]" 
        options={{ 
          headerShown: true, 
          title: "तपशील (Details)", 
          headerBackTitle: "मागे" 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <TractorProvider>
      <InitialLayout />
    </TractorProvider>
  );
}