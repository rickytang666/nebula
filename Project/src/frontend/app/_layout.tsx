import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inMainGroup = segments[0] === "(main)";

    console.log("[Auth Guard]", { session: !!session, segments, inAuthGroup, inMainGroup, hasRedirected: hasRedirected.current });

    // Prevent multiple redirects
    if (hasRedirected.current) {
      console.log("[Auth Guard] Skipping - already redirected");
      return;
    }

    if (session && !inMainGroup) {
      console.log("[Auth Guard] Redirecting to /(main)");
      hasRedirected.current = true;
      setTimeout(() => {
        router.replace("/(main)");
        console.log("[Auth Guard] router.replace('/(main)') executed");
      }, 0);
    } else if (!session && inMainGroup) {
      console.log("[Auth Guard] Redirecting to /");
      hasRedirected.current = true;
      setTimeout(() => {
        router.replace("/");
        console.log("[Auth Guard] router.replace('/') executed");
      }, 0);
    }
  }, [session, loading]);

  // Reset redirect flag when session changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [session]);

  if (loading) {
    return (
      <GluestackUIProvider mode="dark">
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
            }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        </SafeAreaProvider>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode="dark">
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000000" },
            animation: "fade",
          }}
        />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
