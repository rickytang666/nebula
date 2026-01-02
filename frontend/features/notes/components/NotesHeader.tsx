import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Image } from 'expo-image';

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
        <Image
          source={require('@/public/logo.svg')}
          style={{ width: 50, height: 50 }}
          contentFit="contain"
          transition={100}
        />
        <Text className="text-base-content text-3xl font-bold tracking-tight">
          Nebula
        </Text>
      </View>

      <Pressable
        className="bg-primary rounded-xl px-4 flex-row items-center"
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
          </View>
        )}
      </Pressable>
    </View>
  );
}
