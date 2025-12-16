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
                ? 'border-blue-500'
                : ''
                }`}
            style={isSemantic ? { backgroundColor: '#E0F2FE', borderColor: '#00A4F2' } : { backgroundColor: '#F5F5F4', borderColor: '#E6E4E3' }}
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
