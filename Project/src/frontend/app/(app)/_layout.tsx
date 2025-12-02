import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

export default function MainLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      // Just replace to landing page. dismissAll might be causing POP_TO_TOP error if stack is empty.
      router.replace("/");
    }
  }, [session, loading]);

  // Show loading screen while checking session or redirecting
  if (loading || !session) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' },
      }}
    />
  );
}