import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotesHeaderProps {
  onNewNote: () => void;
}

export default function NotesHeader({ onNewNote }: NotesHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <Text className="text-white text-3xl font-bold">
        Notes
      </Text>
      
      <Pressable
        className="bg-blue-600 rounded-xl px-4 flex-row items-center"
        style={{ minHeight: 44 }}
        onPress={onNewNote}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        accessibilityLabel="Create new note"
        accessibilityRole="button"
        accessibilityHint="Opens a new note for editing"
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.8 : 1 }} className="flex-row items-center">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">
              New Note
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
