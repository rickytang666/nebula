import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotesHeaderProps {
  onNewNote: () => void;
  onScan: () => void;
}

export default function NotesHeader({ onNewNote, onScan }: NotesHeaderProps) {
  const handleCreatePress = () => {
    Alert.alert(
      'Create Note',
      'Choose how you want to create a note',
      [
        {
          text: 'New Note',
          onPress: onNewNote,
        },
        {
          text: 'Scan Image',
          onPress: onScan,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center justify-between mb-6">
      <Text className="text-white text-3xl font-bold">
        Notes
      </Text>

      <Pressable
        className="bg-blue-500 rounded-xl px-4 flex-row items-center"
        style={{ minHeight: 44 }}
        onPress={handleCreatePress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        accessibilityLabel="Create note"
        accessibilityRole="button"
        accessibilityHint="Choose to create a new note or scan an image"
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.8 : 1 }} className="flex-row items-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">
              Create
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
