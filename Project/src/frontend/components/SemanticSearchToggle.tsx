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
            className={`flex-row items-center px-3 py-2 rounded-full border ${isSemantic
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
            accessibilityRole="switch"
            accessibilityLabel={`Switch to ${isSemantic ? 'keyword' : 'semantic'} search`}
            accessibilityState={{ checked: isSemantic }}
        >
            <Ionicons
                name={isSemantic ? "sparkles" : "search-outline"}
                size={16}
                color={isSemantic ? "#60A5FA" : "#9CA3AF"}
            />
            <Text
                className={`ml-2 text-sm font-medium ${isSemantic ? 'text-blue-400' : 'text-gray-400'
                    }`}
            >
                {isSemantic ? 'Semantic Search' : 'Keyword Search'}
            </Text>
        </Pressable>
    );
}
