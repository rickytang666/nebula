import { useRouter , Redirect } from "expo-router";
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
import { Bot, Camera, Shield } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from 'expo-image';

export default function LandingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log("[Landing Page] MOUNTED");
    return () => console.log("[Landing Page] UNMOUNTED");
  }, []);

  if (!loading && session) {
    return <Redirect href="/(app)/(tabs)/notes" />;
  }

  return (
    <Box className="flex-1 bg-black">
      <StatusBar style="light" />
      <Center className="flex-1 px-6">
        <VStack space="4xl" className="w-full max-w-md items-center">
          {/* Logo/Icon Area */}
          <Box className="items-center">
            <Box className="mb-6">
              <Image
                source={require('@/public/logo.svg')}
                style={{ width: 150, height: 150 }}
                contentFit="contain"
                transition={100}
              />
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
            <HStack space="md" className="items-center bg-gray-900 rounded-xl p-4 border border-gray-800">
              <Camera size={24} color="#2196F3" />
              <Text className="text-gray-300 flex-1">Photo to Notes</Text>
            </HStack>
            <HStack space="md" className="items-center bg-gray-900 rounded-xl p-4 border border-gray-800">
              <Bot size={24} color="#2196F3" />
              <Text className="text-gray-300 flex-1">Chat with AI</Text>
            </HStack>
            <HStack space="md" className="items-center bg-gray-900 rounded-xl p-4 border border-gray-800">
              <Shield size={24} color="#2196F3" />
              <Text className="text-gray-300 flex-1">Secure and Private</Text>
            </HStack>
          </VStack>

          {/* CTA Buttons */}
          <VStack space="md" className="w-full mt-8">
            <Button
              size="xl"
              className="w-full bg-primary rounded-xl"
              onPress={() => router.push("/login")}
            >
              <ButtonText className="text-white font-semibold text-lg">
                Sign In
              </ButtonText>
            </Button>

            <Button
              size="xl"
              variant="outline"
              className="w-full border-2 border-primary rounded-xl"
              onPress={() => router.push("/signup")}
            >
              <ButtonText className="text-primary font-semibold text-lg">
                Create Account
              </ButtonText>
            </Button>
          </VStack>

          {/* Footer */}
          <Text size="sm" className="text-gray-500 text-center mt-4">
            Your knowledge, intelligently organized
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}
