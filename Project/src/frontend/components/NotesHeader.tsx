import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotesHeaderProps {
  onNewNote: () => void;
  onScan: () => void;
}

export default function NotesHeader({ onNewNote, onScan }: NotesHeaderProps) {

  return (
    <View className="flex-row items-center justify-between mb-6">
      <Text className="text-white text-3xl font-bold">
        Notes
      </Text>

      <View className="flex-row gap-2">
        <Pressable
          className="bg-gray-800 rounded-xl px-4 flex-row items-center justify-center border border-gray-700"
          style={{ minHeight: 44, width: 44 }}
          onPress={onScan}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          accessibilityLabel="Scan note"
          accessibilityRole="button"
          accessibilityHint="Take a photo or select image to scan text"
        >
          {({ pressed }) => (
            <Ionicons
              name="scan"
              size={20}
              color={pressed ? "#9CA3AF" : "white"}
              style={{ opacity: pressed ? 0.8 : 1 }}
            />
          )}
        </Pressable>

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
    </View>
  );
}
