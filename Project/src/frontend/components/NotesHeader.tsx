import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import NebulaLogo from './NebulaLogo';

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
      <View className="flex-row items-center">
        <NebulaLogo size={50} />
        <Text className="text-base-content text-3xl font-bold font-inter tracking-tight">
          Nebula
        </Text>
      </View>

      <Pressable
        className="bg-primary rounded-xl px-4 flex-row items-center shadow-lg shadow-blue-900/20"
        style={{ minHeight: 44 }}
        onPress={handleCreatePress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        accessibilityLabel="Create note"
        accessibilityRole="button"
        accessibilityHint="Choose to create a new note or scan an image"
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.8 : 1 }} className="flex-row items-center">
            <Plus size={20} color="white" strokeWidth={2.5} />
            <Text className="text-white font-semibold font-inter ml-1.5">
              New Note
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
