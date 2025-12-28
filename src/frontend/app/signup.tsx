import { useState } from "react";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { api } from "@/services/api";
import NebulaLogo from "@/components/NebulaLogo";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href="/(app)/(tabs)/notes" />;
  }

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
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
      console.log('signing up with email:', email);
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
        // Step 2: Create profile in backend
        try {
          await api.profiles.create({
            full_name: name.trim(),
          });

          Alert.alert(
            "Success!",
            "Account created successfully. Please sign in.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/login"),
              },
            ]
          );
        } catch (profileError) {
          console.error("Profile creation failed:", profileError);
          Alert.alert(
            "Account Created",
            "Your account was created but we encountered an issue setting up your profile. Please contact support.",
            [{ text: "OK", onPress: () => router.replace("/login") }]
          );
        }
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-base-100">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <View className="px-6 pt-4">
            <Pressable 
              onPress={() => router.back()}
              className="flex-row items-center p-2 -ml-2 rounded-lg active:bg-base-200/50"
            >
              <ArrowLeft size={24} color="#94a3b8" />
              <Text className="text-base-content/70 ml-2 text-base font-medium">Back</Text>
            </Pressable>
          </View>

          <View className="flex-1 px-8 pt-6 pb-12">
            
            {/* Header */}
            <View className="mb-8 items-center">
              <NebulaLogo size={150} />
              <Text className="text-base-content text-3xl font-bold tracking-tight">
                Create Account
              </Text>
              <Text className="text-base-content/60 text-base mt-2">
                Start taking notes with Nebula today
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-5">
              
              <View>
                <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                  Full Name
                </Text>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  className="bg-base-200 border border-base-300 rounded-xl px-4 py-3.5 text-base-content text-base focus:border-primary"
                />
              </View>

              <View>
                <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                  Email
                </Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-base-200 border border-base-300 rounded-xl px-4 py-3.5 text-base-content text-base focus:border-primary"
                />
              </View>

              <View>
                <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    placeholder="Create a password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3.5 text-base-content text-base focus:border-primary pr-12"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              <View>
                <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#94a3b8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3.5 text-base-content text-base focus:border-primary pr-12"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleSignUp}
                disabled={isLoading}
                className={`w-full bg-primary rounded-xl h-14 justify-center items-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all mt-4 ${isLoading ? 'opacity-70' : ''}`}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Create Account
                  </Text>
                )}
              </Pressable>

            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-8 mb-4">
              <Text className="text-base-content/60">Already have an account? </Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text className="text-primary font-bold">Sign In</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


