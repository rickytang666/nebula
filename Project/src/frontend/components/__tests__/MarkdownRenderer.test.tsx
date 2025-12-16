import React from 'react';
import { render } from '@testing-library/react-native';
import MarkdownRenderer from '../MarkdownRenderer';

// Mock WebView
jest.mock('react-native-webview', () => {
    const { View } = require('react-native');
    return {
        WebView: (props: any) => <View {...props} testID="mock-webview" />,
    };
});

describe('MarkdownRenderer', () => {
    it('renders correctly with content', () => {
        const content = '# Hello World\nThis is **bold**.';
        const tree = render(<MarkdownRenderer content={content} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
