import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <AuthProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
