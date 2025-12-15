import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  isSemantic?: boolean;
  onToggleSemantic?: (value: boolean) => void;
}

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Search notes...',
  isSemantic = false,
  onToggleSemantic
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View className="bg-gray-900 rounded-xl border border-gray-700 flex-row items-center px-4" style={{ minHeight: 48 }}>
      <Pressable onPress={onSearch} hitSlop={8}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
      </Pressable>
      <TextInput
        className="flex-1 text-white ml-3 text-base"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        accessibilityLabel="Search notes"
        accessibilityHint="Type to search notes by title"
      />
      {onToggleSemantic && (
        <Pressable
          onPress={() => onToggleSemantic(!isSemantic)}
          hitSlop={8}
          className="ml-2"
          accessibilityRole="switch"
          accessibilityLabel={`Switch to ${isSemantic ? 'keyword' : 'semantic'} search`}
          accessibilityState={{ checked: isSemantic }}
        >
          <Ionicons
            name={isSemantic ? "sparkles" : "sparkles-outline"}
            size={20}
            color={isSemantic ? "#60A5FA" : "#6B7280"}
          />
        </Pressable>
      )}
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={12}
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={20} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
}
