import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '../types/note';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (Latest First)' },
  { value: 'date-asc', label: 'Date (Earliest First)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

export default function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentOption = SORT_OPTIONS.find(opt => opt.value === sortBy);

  const handleOptionSelect = (option: SortOption) => {
    onSortChange(option);
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        className="bg-gray-900 rounded-xl border border-gray-700 items-center justify-center h-12 w-12"
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel={`Sort by ${currentOption?.label}`}
        accessibilityRole="button"
        accessibilityHint="Opens sort options menu"
      >
        <Ionicons name="filter" size={20} color="#9CA3AF" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
          accessibilityLabel="Close sort menu"
          accessibilityRole="button"
        >
          <View className="bg-gray-900 rounded-2xl border border-gray-700 mx-6 overflow-hidden">
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                className={`px-6 ${sortBy === option.value ? 'bg-gray-800' : ''}`}
                style={{ minHeight: 56 }}
                onPress={() => handleOptionSelect(option.value)}
                accessibilityLabel={option.label}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: sortBy === option.value }}
              >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text className={`text-base ${sortBy === option.value ? 'text-white font-semibold' : 'text-gray-300'}`}>
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
});
