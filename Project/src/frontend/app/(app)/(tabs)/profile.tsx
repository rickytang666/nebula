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
import { Ionicons } from '@expo/vector-icons';

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
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const hasChanges = fullName !== initialFullName;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl text-gray-400 font-bold">
                {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold">{fullName || 'User'}</Text>
            <Text className="text-gray-500">{user?.email}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-400 mb-2 text-sm font-medium">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 text-white p-4 rounded-lg border border-gray-800 text-base"
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || saving}
            className={`p-4 rounded-lg items-center mb-6 ${hasChanges && !saving ? 'bg-blue-600' : 'bg-gray-800 opacity-50'
              }`}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>

          <View className="border-t border-gray-800 pt-6 mt-auto">
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center justify-center p-4 rounded-lg border border-red-900/50 bg-red-900/10"
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text className="text-red-500 font-bold text-base">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}