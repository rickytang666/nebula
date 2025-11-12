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
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel
} from "@/components/ui";
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Create auth account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        Alert.alert("Signup Failed", error.message);
        return;
      }

      if (data.user) {
        // Step 2: TODO - Call backend to create profile when ready
        // For now, just show success and navigate to login
        Alert.alert(
          "Success!",
          "Account created successfully. Please sign in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
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
                    Create Account
                  </Heading>
                  
                  <Text size="md" className="text-gray-400 text-center">
                    Start taking notes today
                  </Text>
                </VStack>

                {/* Sign Up Form */}
                <VStack space="lg" className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
                  <VStack space="md">
                    <Text className="text-gray-300 font-medium">Full Name</Text>
                    <Input
                      variant="outline"
                      size="xl"
                      className="border-gray-700 bg-black rounded-xl"
                      style={styles.input}
                    >
                      <InputField
                        placeholder="Enter your full name"
                        placeholderTextColor="#6B7280"
                        value={name}
                        onChangeText={setName}
                        className="text-white"
                        style={styles.inputField}
                      />
                    </Input>
                  </VStack>

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
                        placeholder="Create a password"
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

                  <VStack space="md">
                    <Text className="text-gray-300 font-medium">Confirm Password</Text>
                    <Input
                      variant="outline"
                      size="xl"
                      className="border-gray-700 bg-black rounded-xl"
                      style={styles.input}
                    >
                      <InputField
                        placeholder="Confirm your password"
                        placeholderTextColor="#6B7280"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        type={showConfirmPassword ? "text" : "password"}
                        autoCapitalize="none"
                        className="text-white"
                        style={styles.inputField}
                      />
                      <Pressable 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="pr-3"
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </Pressable>
                    </Input>
                  </VStack>

                  {/* Terms and Conditions */}
                  <HStack space="sm" className="items-start">
                    <Checkbox
                      value="terms"
                      isChecked={agreeToTerms}
                      onChange={setAgreeToTerms}
                      className="mt-1"
                    >
                      <CheckboxIndicator>
                        <CheckboxIcon />
                      </CheckboxIndicator>
                      <CheckboxLabel className="text-gray-400 text-sm flex-1">
                        I agree to the{" "}
                        <Text className="text-white font-medium">
                          Terms of Service
                        </Text>
                        {" "}and{" "}
                        <Text className="text-white font-medium">
                          Privacy Policy
                        </Text>
                      </CheckboxLabel>
                    </Checkbox>
                  </HStack>

                  <Button
                    size="xl"
                    className="w-full bg-white rounded-xl mt-4"
                    onPress={handleSignUp}
                    isDisabled={isLoading}
                  >
                    <ButtonText className="text-black font-semibold text-lg">
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </ButtonText>
                  </Button>
                </VStack>

                {/* Sign In Link */}
                <HStack space="xs" className="justify-center">
                  <Text className="text-gray-400">Already have an account?</Text>
                  <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Text className="text-white font-bold underline">
                      Sign In
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
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#000000',
  },
  inputField: {
    color: '#FFFFFF',
  } as any,
});
