import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { LogOut, User, Save, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialFullName, setInitialFullName] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await api.profiles.getMe();
      if (profile) {
        setFullName(profile.full_name || '');
        setInitialFullName(profile.full_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await api.profiles.update({ full_name: fullName });
      setInitialFullName(fullName);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-base-100 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  const hasChanges = fullName !== initialFullName;

  return (
    <SafeAreaView className="flex-1 bg-base-100" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
          
          {/* Header */}
          <Text className="text-base-content text-center text-3xl font-bold mb-8">Profile</Text>

          {/* Avatar Section */}
          <View className="items-center mb-10">
            <View className="w-28 h-28 bg-primary/20 rounded-full items-center justify-center mb-4 border border-primary/30 shadow-sm">
              <User size={40} color="#3b82f6" />
            </View>
            <Text className="text-base-content text-xl font-bold">{fullName || 'User'}</Text>
            <View className="flex-row items-center mt-1">
              <Mail size={14} color="#94a3b8" />
              <Text className="text-base-content/60 ml-1.5">{user?.email}</Text>
            </View>
          </View>

          {/* Form Section */}
          <View className="mb-6 space-y-4">
            <View>
              <View className="flex-row items-center">
                <Text className="text-base-content/70 mb-2 text-sm font-medium ml-1">Full Name</Text>
              </View>
              <View className="flex-row items-center bg-base-200 border border-base-300 rounded-xl h-12 px-3">
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                  placeholderTextColor="#64748b"
                  className="flex-1 ml-3 text-base-content text-base"
                  autoCapitalize="words"
                  autoComplete="name"
                  style={{ paddingVertical: 0, height: 48, lineHeight: 20 }}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || saving}
            className="flex-row justify-center items-center py-4 rounded-xl shadow-sm mb-6 transition-all bg-primary"
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text className="font-bold text-white">
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="mt-auto pt-6">
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center justify-center py-4 rounded-xl border border-error/20 bg-error/5 active:bg-error/10"
            >
              <LogOut size={20} color="#f87171" style={{ marginRight: 8 }} />
              <Text className="text-error font-bold text-base">Sign Out</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}