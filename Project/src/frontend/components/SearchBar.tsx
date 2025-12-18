import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, Sparkles, XCircle } from 'lucide-react-native';

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
    <View className="bg-base-200 rounded-full border border-base-300 flex-row items-center px-4 mr-4" style={{ minHeight: 40 }}>
      <Pressable onPress={onSearch} hitSlop={8}>
        <Search size={20} color="#94a3b8" />
      </Pressable>
      <TextInput
        className="flex-1 text-base-content font-inter ml-2 mr-2 text-base min-w-0"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        accessibilityLabel="Search notes"
        accessibilityHint="Type to search notes by title"
        textAlignVertical="center"
        style={{ paddingVertical: 0, height: '100%' }}
      />
      <View className="flex-row items-center gap-2 shrink-0">
        {onToggleSemantic && (
          <Pressable
            onPress={() => onToggleSemantic(!isSemantic)}
            hitSlop={8}
            accessibilityRole="switch"
            accessibilityLabel={`Switch to ${isSemantic ? 'keyword' : 'semantic'} search`}
            accessibilityState={{ checked: isSemantic }}
          >
            <Sparkles
              size={20}
              color={isSemantic ? "#60a5fa" : "#94a3b8"}
              fill={isSemantic ? "#60a5fa" : "transparent"}
            />
          </Pressable>
        )}
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <XCircle size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
    </View>
  );
}