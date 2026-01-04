import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  configureReanimatedLogger,
} from "react-native-reanimated";

import { View, ActivityIndicator, useColorScheme, Alert } from "react-native";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { useEffect } from "react";
import * as Linking from "expo-linking";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// disable strict mode to suppress warning
configureReanimatedLogger({
  strict: false,
});

function RootLayoutNav() {
  const { loading } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    JetBrainsMono_400Regular,
  });

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // Check if it's a password reset link
      if (url.includes('reset-password')) {
        // Supabase sends tokens in the URL fragment (after #), not query params
        // Format: nebula://reset-password#access_token=...&refresh_token=...

        // Extract fragment (everything after #)
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          const params = new URLSearchParams(fragment);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          console.log('Tokens found:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });

          if (accessToken && refreshToken) {
            // Set the session with the access token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error);
              Alert.alert('Error', 'Failed to verify reset link. Please try again.');
            } else {
              console.log('Session set successfully, navigating to reset password');
              // Clear entire navigation stack and navigate to reset password
              router.dismissAll();
              router.replace('/reset-password');
            }
          } else {
            console.error('No tokens found in URL');
            Alert.alert('Error', 'Invalid reset link. Please request a new one.');
          }
        } else {
          console.error('No hash fragment in URL');
        }
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#000000" : "#FAFAFA", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <GluestackUIProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === "dark" ? "#000000" : "#FAFAFA" },
            animation: "fade",
          }}
        />
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colorScheme === "dark" ? "rgba(0, 0, 0, 0.9)" : "rgba(250, 250, 250, 0.9)",
              zIndex: 999,
            }}
          >
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
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
