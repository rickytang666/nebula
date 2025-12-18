import React, { useState } from "react";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator
} from "react-native";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import NebulaLogo from "../components/NebulaLogo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!loading && session) {
    return <Redirect href="/(app)/(tabs)/notes" />;
  }

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
        router.dismissAll();
        router.replace("/(app)/(tabs)/notes");
        return;
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Login error:", error);
      return;
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

          <View className="flex-1 px-8 justify-center pb-12">
            
            {/* Logo Section */}
            <View className="items-center mb-12">
              <NebulaLogo size={150} />
              <Text className="text-base-content text-3xl font-bold mt-8 tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-base-content/60 text-base mt-2">
                Sign in to your notes
              </Text>
            </View>

            {/* Login Form */}
            <View className="space-y-6">
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
                    placeholder="Enter your password"
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
                
                <Pressable className="self-end mt-2 p-1" onPress={() => {}}>
                  <Text className="text-primary text-sm font-medium">
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full bg-primary rounded-xl h-14 justify-center items-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all ${isLoading ? 'opacity-70' : ''}`}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Sign In
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-base-content/60">Don't have an account? </Text>
              <Pressable onPress={() => router.push("/signup")}>
                <Text className="text-primary font-bold">Sign Up</Text>
              </Pressable>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


