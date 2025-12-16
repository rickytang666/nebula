import React from 'react';
import { render } from '@testing-library/react-native';
import NotesHeader from '../NotesHeader';

// Mock UI components
jest.mock('../../components/ui', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        HStack: (props: any) => <View {...props} style={{ flexDirection: 'row' }} />,
        VStack: (props: any) => <View {...props} />,
        Heading: (props: any) => <Text {...props} />,
        Text: (props: any) => <Text {...props} />,
    };
});

describe('NotesHeader', () => {
    it('renders correctly', () => {
        const props = {
            isSelectionMode: false,
            selectedCount: 0,
            onCancelSelection: jest.fn(),
            onSelectAll: jest.fn(),
            onDeleteSelected: jest.fn(),
            menuVisible: false,
            onToggleMenu: jest.fn(),
            onSignOut: jest.fn(),
            onScan: jest.fn(),
            onNewNote: jest.fn(),
        };
        const tree = render(<NotesHeader {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
