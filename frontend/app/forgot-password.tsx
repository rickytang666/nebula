import React, { useState } from "react";
import { useRouter, Stack } from "expo-router";
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
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import { Image } from 'expo-image';
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const emailRef = React.useRef<TextInput>(null);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Invalid Email", "Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'nebula://reset-password',
            });

            if (error) {
                Alert.alert("Error", error.message);
                return;
            }

            // Success - show confirmation
            setEmailSent(true);
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <>
                <Stack.Screen options={{ gestureEnabled: false }} />
                <SafeAreaView className="flex-1 bg-base-100">
                    <StatusBar style="light" />
                    <View className="flex-1 px-8 justify-center items-center">
                        <CheckCircle size={80} color="#3b82f6" />
                        <Text className="text-base-content text-2xl font-bold mt-6 text-center">
                            Check Your Email
                        </Text>
                        <Text className="text-base-content/60 text-base mt-3 text-center leading-6">
                            We&apos;ve sent a password reset link to{"\n"}
                            <Text className="text-primary font-semibold">{email}</Text>
                        </Text>
                        <Text className="text-base-content/60 text-sm mt-6 text-center leading-5">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </Text>

                        <Pressable
                            onPress={() => router.replace("/login")}
                            className="w-full bg-primary rounded-xl h-14 justify-center items-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all mt-8"
                            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                        >
                            <Text className="text-white text-lg font-bold">
                                Back to Login
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setEmailSent(false)}
                            className="mt-4 p-2"
                        >
                            <Text className="text-primary text-sm font-medium">
                                Didn&apos;t receive the email? Try again
                            </Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </>
        );
    }

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
                            <Image
                                source={require('@/public/logo.svg')}
                                style={{ width: 150, height: 150 }}
                                contentFit="contain"
                                transition={100}
                            />
                            <Text className="text-base-content text-3xl font-bold mt-8 tracking-tight">
                                Forgot Password?
                            </Text>
                            <Text className="text-base-content/60 text-base mt-2 text-center leading-6">
                                Enter your email and we&apos;ll send you a link to reset your password.
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="gap-6">
                            <View>
                                <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                                    Email
                                </Text>
                                <Pressable
                                    onPress={() => emailRef.current?.focus()}
                                    className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary"
                                >
                                    <TextInput
                                        ref={emailRef}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#94a3b8"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoFocus
                                        className="flex-1 text-base-content"
                                        style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_400Regular', paddingVertical: 0 }}
                                    />
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={handleResetPassword}
                                disabled={isLoading}
                                className={`w-full bg-primary rounded-xl h-14 justify-center items-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all ${isLoading ? 'opacity-70' : ''}`}
                                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">
                                        Send Reset Link
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        {/* Back to Login Link */}
                        <View className="flex-row justify-center mt-8">
                            <Text className="text-base-content/60">Remember your password? </Text>
                            <Pressable onPress={() => router.back()}>
                                <Text className="text-primary font-bold">Sign In</Text>
                            </Pressable>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
