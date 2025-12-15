import React from 'react';
import { render, screen } from '@testing-library/react-native';
import NoteCard from '../NoteCard';
import { Note } from '../../types/note';

// Mock navigation
const mockRouter = { push: jest.fn() };
jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('react-native', () => {
    const React = require('react');
    return {
        View: (props: any) => React.createElement('View', props, props.children),
        Text: (props: any) => React.createElement('Text', props, props.children),
        Pressable: (props: any) => {
            const children = typeof props.children === 'function'
                ? props.children({ pressed: false })
                : props.children;
            return React.createElement('Pressable', props, children);
        },
        ScrollView: (props: any) => React.createElement('ScrollView', props, props.children),
        Animated: {
            View: (props: any) => React.createElement('Animated.View', props, props.children),
            timing: () => ({ start: jest.fn() }),
            spring: () => ({ start: jest.fn() }),
            parallel: () => ({ start: jest.fn() }),
            Value: function () { return { interpolate: jest.fn() } },
        },
        Platform: { OS: 'ios', select: (obj: any) => obj.ios },
        StyleSheet: { create: (obj: any) => obj, flatten: (obj: any) => obj },
    };
});


const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'This is a test note content.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    // basic_stats removed as it is not in the type definition
};

describe('NoteCard', () => {
    it('renders correctly', () => {
        const tree = render(
            <NoteCard note={mockNote} onPress={jest.fn()} />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
