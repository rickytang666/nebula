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
        useColorScheme: () => 'light',
        Touchable: { Mixin: {} },
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

jest.mock('react-native-webview', () => {
    const { View } = require('react-native');
    return {
        WebView: (props) => View(props),
    };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Pattern: View,
    Mask: View,
    Marker: View,
    Filter: View,
    FeGaussianBlur: View,
    FeMerge: View,
    FeMergeNode: View,
    FeMergeNode: View,
  };
});

jest.mock('lucide-react-native', () => {
  return new Proxy({}, {
    get: (target, prop) => {
      const MockIcon = (props) => {
        const React = require('react');
        return React.createElement('View', { ...props, testID: `lucide-${String(prop)}` });
      };
      return MockIcon;
    }
  });
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props) => {
      return View({ ...props, testID: 'expo-image-mock' });
    },
  };
});
