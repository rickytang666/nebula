import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SemanticSearchToggleProps {
    isSemantic: boolean;
    onToggle: (value: boolean) => void;
}

export default function SemanticSearchToggle({ isSemantic, onToggle }: SemanticSearchToggleProps) {
    return (
        <Pressable
            onPress={() => onToggle(!isSemantic)}
            className={`items-center justify-center rounded-xl border h-12 w-12 ${isSemantic
                ? 'bg-blue-900/30 border-blue-500'
                : 'bg-gray-900 border-gray-700'
                }`}
            accessibilityRole="switch"
            accessibilityLabel={`Switch to ${isSemantic ? 'keyword' : 'semantic'} search`}
            accessibilityState={{ checked: isSemantic }}
        >
            <Ionicons
                name={isSemantic ? "sparkles" : "sparkles-outline"}
                size={20}
                color={isSemantic ? "#60A5FA" : "#9CA3AF"}
            />
        </Pressable>
    );
}
