import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { Image } from 'expo-image';
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordRef = React.useRef<TextInput>(null);
    const confirmPasswordRef = React.useRef<TextInput>(null);

    useEffect(() => {
        // Check if we have an access token from the deep link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                Alert.alert(
                    "Invalid Link",
                    "This password reset link is invalid or has expired. Please request a new one.",
                    [{
                        text: "OK", onPress: () => {
                            router.dismissAll();
                            router.replace("/forgot-password");
                        }
                    }]
                );
            }
        };
        checkSession();
    }, [router]);

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
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
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                Alert.alert("Error", error.message);
                return;
            }

            // Sign out the user so they have to log in with new password
            await supabase.auth.signOut();

            // Success
            Alert.alert(
                "Success!",
                "Your password has been reset successfully. Please sign in with your new password.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.dismissAll();
                            router.replace("/login");
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ gestureEnabled: false }} />
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
                                onPress={() => router.replace("/login")}
                                className="flex-row items-center p-2 -ml-2 rounded-lg active:bg-base-200/50"
                            >
                                <ArrowLeft size={24} color="#94a3b8" />
                                <Text className="text-base-content/70 ml-2 text-base font-medium">Back to Login</Text>
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
                                    Reset Password
                                </Text>
                                <Text className="text-base-content/60 text-base mt-2 text-center leading-6">
                                    Enter your new password below
                                </Text>
                            </View>

                            {/* Form */}
                            <View className="gap-6">
                                <View>
                                    <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                                        New Password
                                    </Text>
                                    <Pressable
                                        onPress={() => passwordRef.current?.focus()}
                                        className="relative bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary pr-12"
                                    >
                                        <TextInput
                                            ref={passwordRef}
                                            placeholder="Enter new password"
                                            placeholderTextColor="#94a3b8"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoFocus
                                            textContentType="newPassword"
                                            className="flex-1 text-base-content"
                                            style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_400Regular', paddingVertical: 0 }}
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
                                    </Pressable>
                                </View>

                                <View>
                                    <Text className="text-base-content/70 text-sm font-medium mb-2 ml-1">
                                        Confirm Password
                                    </Text>
                                    <Pressable
                                        onPress={() => confirmPasswordRef.current?.focus()}
                                        className="relative bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary pr-12"
                                    >
                                        <TextInput
                                            ref={confirmPasswordRef}
                                            placeholder="Confirm new password"
                                            placeholderTextColor="#94a3b8"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            textContentType="newPassword"
                                            className="flex-1 text-base-content"
                                            style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_400Regular', paddingVertical: 0 }}
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
                                            Reset Password
                                        </Text>
                                    )}
                                </Pressable>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
