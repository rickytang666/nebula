import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { ArrowDownUp } from 'lucide-react-native';
import { SortOption } from '../../../types/note';

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
        className="bg-base-200 rounded-2xl border border-base-300 items-center justify-center h-10 w-10"
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel={`Sort by ${currentOption?.label}`}
        accessibilityRole="button"
        accessibilityHint="Opens sort options menu"
        android_ripple={{ color: 'rgba(59, 130, 246, 0.1)' }}
      >
        <ArrowDownUp size={20} color="#94a3b8" />
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
          <View className="bg-base-200 rounded-2xl border border-base-300 mx-4 overflow-hidden shadow-2xl">
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                className={`px-4 ${sortBy === option.value ? 'bg-base-300' : ''}`}
                style={{ minHeight: 56 }}
                onPress={() => handleOptionSelect(option.value)}
                accessibilityLabel={option.label}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: sortBy === option.value }}
              >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text className={`text-base ${sortBy === option.value ? 'text-primary font-semibold' : 'text-base-content/80'}`}>
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
