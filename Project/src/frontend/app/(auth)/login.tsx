import { useState } from "react";
import { useRouter } from "expo-router";
import { 
  Box, 
  VStack, 
  HStack,
  Center,
  Heading, 
  Text, 
  Button, 
  ButtonText,
  Input,
  InputField,
  Pressable,
} from "@/components/ui";
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      if (data.session) {
        // Successfully logged in
        router.dismissAll();
        router.replace("/(main)/home");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
      router.dismissAll();
      router.replace("/(main)/(tabs)/notes");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Box className="flex-1 bg-black">
        <StatusBar style="light" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button - Inside ScrollView */}
            <Box className="px-6 pt-4 pb-4">
              <Pressable onPress={() => router.back()}>
                <HStack space="sm" className="items-center">
                  <Ionicons name="arrow-back" size={24} color="white" />
                  <Text className="text-white">Back</Text>
                </HStack>
              </Pressable>
            </Box>

            <Box className="px-6 pb-8">
              <VStack space="2xl" className="w-full max-w-md mx-auto">
                {/* Header */}
                <VStack space="md" className="items-center">
                  <Heading size="3xl" className="text-white text-center mb-2">
                    Welcome Back
                  </Heading>
                  
                  <Text size="md" className="text-gray-400 text-center">
                    Sign in to your notes
                  </Text>
                </VStack>

                {/* Login Form */}
                <VStack space="lg" className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                  <VStack space="md">
                    <Text className="text-gray-300 font-medium">Email</Text>
                    <Input
                      variant="outline"
                      size="xl"
                      className="border-gray-700 bg-black rounded-xl"
                      style={styles.input}
                    >
                      <InputField
                        placeholder="Enter your email"
                        placeholderTextColor="#6B7280"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="text-white"
                        style={styles.inputField}
                      />
                    </Input>
                  </VStack>

                  <VStack space="md">
                    <Text className="text-gray-300 font-medium">Password</Text>
                    <Input
                      variant="outline"
                      size="xl"
                      className="border-gray-700 bg-black rounded-xl"
                      style={styles.input}
                    >
                      <InputField
                        placeholder="Enter your password"
                        placeholderTextColor="#6B7280"
                        value={password}
                        onChangeText={setPassword}
                        type={showPassword ? "text" : "password"}
                        autoCapitalize="none"
                        className="text-white"
                        style={styles.inputField}
                      />
                      <Pressable 
                        onPress={() => setShowPassword(!showPassword)}
                        className="pr-3"
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </Pressable>
                    </Input>
                  </VStack>

                  <Pressable onPress={() => {}}>
                    <Text className="text-gray-400 text-right font-medium">
                      Forgot Password?
                    </Text>
                  </Pressable>

                  <Button
                    size="xl"
                    className="w-full bg-white rounded-xl mt-4"
                    onPress={handleLogin}
                    isDisabled={isLoading}
                  >
                    <ButtonText className="text-black font-semibold text-lg">
                      {isLoading ? "Signing In..." : "Sign In"}
                    </ButtonText>
                  </Button>
                </VStack>

                {/* Sign Up Link */}
                <HStack space="xs" className="justify-center">
                  <Text className="text-gray-400">Don't have an account?</Text>
                  <Pressable onPress={() => router.push("/(auth)/signup")}>
                    <Text className="text-white font-bold underline">
                      Sign Up
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#000000',
  },
  inputField: {
    color: '#FFFFFF',
  } as any,
});
