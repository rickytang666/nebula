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
