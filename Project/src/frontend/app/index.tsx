import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Center,
  Heading,
  Text,
  Button,
  ButtonText,
} from "@/components/ui";
import { StatusBar } from 'expo-status-bar';

import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import NebulaLogo from "@/components/NebulaLogo";

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href="/(app)/(tabs)/notes" />;
  }

  useEffect(() => {
    console.log("[Landing Page] MOUNTED");
    return () => console.log("[Landing Page] UNMOUNTED");
  }, []);

  return (
    <Box className="flex-1 bg-black">
      <StatusBar style="light" />
      <Center className="flex-1 px-6">
        <VStack space="4xl" className="w-full max-w-md items-center">
          {/* Logo/Icon Area */}
          <Box className="items-center">
            <Box className="mb-6">
              <NebulaLogo size={150} />
            </Box>

            <Heading size="3xl" className="text-white text-center mb-2">
              Nebula
            </Heading>

            <Text size="lg" className="text-gray-400 text-center">
              Simple. Clean. Organized.
            </Text>
          </Box>

          {/* Features */}
          <VStack space="md" className="w-full">
            <FeatureItem
              icon="✓"
              text="Minimalist note-taking"
            />
            <FeatureItem
              icon="📁"
              text="Organize with ease"
            />
            <FeatureItem
              icon="🔒"
              text="Secure and private"
            />
          </VStack>

          {/* CTA Buttons */}
          <VStack space="md" className="w-full mt-8">
            <Button
              size="xl"
              className="w-full bg-white rounded-xl"
              onPress={() => router.push("/login")}
            >
              <ButtonText className="text-black font-semibold text-lg">
                Sign In
              </ButtonText>
            </Button>

            <Button
              size="xl"
              variant="outline"
              className="w-full border-2 border-white rounded-xl"
              onPress={() => router.push("/signup")}
            >
              <ButtonText className="text-white font-semibold text-lg">
                Create Account
              </ButtonText>
            </Button>
          </VStack>

          {/* Footer */}
          <Text size="sm" className="text-gray-500 text-center mt-4">
            Your thoughts, beautifully organized
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <HStack space="md" className="items-center bg-gray-900 rounded-xl p-4 border border-gray-800">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-gray-300 flex-1">{text}</Text>
    </HStack>
  );
}
