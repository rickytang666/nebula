import React from 'react';
import { render } from '@testing-library/react-native';
import AIToolsSection from '../AIToolsSection';

// Mock navigation/icons/webview
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('react-native-webview', () => {
    const { View } = require('react-native');
    return {
        WebView: (props: any) => <View {...props} />,
    };
});

// Mock hooks
jest.mock('../../hooks/useAIService', () => ({
    __esModule: true,
    default: () => ({
        loading: false,
        error: null,
        processPrompt: jest.fn(),
    }),
}));

// Mock MarkdownRenderer to simplify snapshot
jest.mock('../MarkdownRenderer', () => 'MarkdownRenderer');

describe('AIToolsSection', () => {
    it('renders correctly', () => {
        const props = {
            onClose: jest.fn(),
            noteContent: 'Test Content',
            noteTitle: 'Test Title',
        };
        const tree = render(<AIToolsSection {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
