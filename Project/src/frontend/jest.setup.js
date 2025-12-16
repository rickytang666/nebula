// Silence the warning: react-test-renderer is deprecated.
const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('react-test-renderer is deprecated')) {
        return;
    }
    originalConsoleError(...args);
};

jest.mock('react-native', () => {
    const React = require('react');
    return {
        View: (props) => React.createElement('View', props, props.children),
        Text: (props) => React.createElement('Text', props, props.children),
        TextInput: (props) => React.createElement('TextInput', props, props.children),
        Pressable: (props) => {
            const children = typeof props.children === 'function'
                ? props.children({ pressed: false })
                : props.children;
            return React.createElement('Pressable', props, children);
        },
        TouchableOpacity: (props) => React.createElement('TouchableOpacity', props, props.children),
        ScrollView: (props) => React.createElement('ScrollView', props, props.children),
        KeyboardAvoidingView: (props) => React.createElement('KeyboardAvoidingView', props, props.children),
        ActivityIndicator: (props) => React.createElement('ActivityIndicator', props, props.children),
        Animated: {
            View: (props) => React.createElement('Animated.View', props, props.children),
            timing: () => ({ start: jest.fn() }),
            spring: () => ({ start: jest.fn() }),
            parallel: () => ({ start: jest.fn() }),
            Value: function () { return { interpolate: jest.fn() } },
        },
        Platform: { OS: 'ios', select: (obj) => obj.ios },
        StyleSheet: { create: (obj) => obj, flatten: (obj) => obj, hairlineWidth: 1 },
        useWindowDimensions: () => ({ width: 375, height: 812 }),
        Alert: { alert: jest.fn() },
    };
});

jest.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
    FontAwesome: 'FontAwesome',
}));
