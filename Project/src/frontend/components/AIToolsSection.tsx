import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MarkdownRenderer from './MarkdownRenderer';

export interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
  type: 'success' | 'error';
}

interface AIToolsSectionProps {
  onClose: () => void;
  noteContent: string;
  noteTitle: string;
}

export const AIToolsSection: React.FC<AIToolsSectionProps> = ({
  onClose,
  noteContent,
  noteTitle,
}) => {
  // State management
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  // Animation refs
  const slideAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate responsive values
  const contentPadding = width >= 768 ? 32 : 16;
  const isWideScreen = width >= 768;

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Scroll to bottom when new response arrives
  useEffect(() => {
    if (responses.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [responses]);

  const handleSubmitPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare context for AI with note content
      const context = {
        noteTitle,
        noteContent,
        userPrompt: prompt,
      };

      // Call AI backend endpoint
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add response to history
      const newResponse: AIResponse = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        response: data.result || 'No response generated',
        timestamp: new Date().toISOString(),
        type: 'success',
      };

      setResponses((prev) => [...prev, newResponse]);
      setPrompt(''); // Clear input after successful submission
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process AI request';
      setError(errorMessage);

      // Add error response to history
      const errorResponse: AIResponse = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        response: errorMessage,
        timestamp: new Date().toISOString(),
        type: 'error',
      };

      setResponses((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  }, [prompt, noteTitle, noteContent]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all AI responses?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setResponses([]);
            setError(null);
          },
        },
      ]
    );
  }, []);

  const handleDeleteResponse = useCallback((id: string) => {
    setResponses((prev) => prev.filter((response) => response.id !== id));
  }, []);

  const handleCopyResponse = useCallback((text: string) => {
    // In a real app, use react-native-clipboard
    Alert.alert('Copied', 'Response copied to clipboard');
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
      className="bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between py-4 border-b border-gray-800 bg-gray-950"
        style={{ paddingHorizontal: contentPadding }}
      >
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={24} color="#3B82F6" />
          <Text className="text-white text-lg font-semibold ml-2">
            AI Assistant
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="p-2"
          style={{ minWidth: 44, minHeight: 44 }}
          accessibilityLabel="Close AI tools"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 flex-col">
        {/* Responses History */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-black"
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: contentPadding,
            paddingTop: 16,
            paddingBottom: responses.length > 0 ? 16 : 0,
          }}
        >
          {responses.length === 0 && (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="sparkles-outline" size={48} color="#6B7280" />
              <Text className="text-gray-400 text-center mt-4">
                Ask AI to help with your note
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Try: "Summarize this note" or "Generate ideas"
              </Text>
            </View>
          )}

          {responses.map((response, index) => (
            <View
              key={response.id}
              className={`mb-4 rounded-lg overflow-hidden ${
                response.type === 'error'
                  ? 'bg-red-900/20 border border-red-800'
                  : 'bg-gray-900 border border-gray-800'
              }`}
            >
              {/* Response Header */}
              <View className="px-4 py-3 border-b border-gray-800 flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      response.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <Text className="text-gray-400 text-xs flex-1">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteResponse(response.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Delete response"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Prompt Section */}
              <View className="px-4 py-3 bg-gray-900/50">
                <Text className="text-xs text-gray-500 mb-1">Your Prompt:</Text>
                <Text className="text-gray-300 text-sm">{response.prompt}</Text>
              </View>

              {/* Response Content */}
              <View className="px-4 py-3">
                {response.type === 'error' ? (
                  <View>
                    <Text className="text-xs text-red-400 mb-1">Error:</Text>
                    <Text className="text-red-300 text-sm">
                      {response.response}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text className="text-xs text-gray-400 mb-2">Response:</Text>
                    <View className="bg-black rounded px-2 py-2">
                      <MarkdownRenderer content={response.response} />
                    </View>
                  </View>
                )}
              </View>

              {/* Response Actions */}
              {response.type === 'success' && (
                <View className="px-4 py-3 border-t border-gray-800 flex-row justify-end gap-2">
                  <TouchableOpacity
                    onPress={() => handleCopyResponse(response.response)}
                    className="flex-row items-center px-3 py-2 bg-gray-800 rounded"
                    accessibilityLabel="Copy response"
                    accessibilityRole="button"
                  >
                    <Ionicons name="copy-outline" size={16} color="#3B82F6" />
                    <Text className="text-blue-400 text-sm ml-1">Copy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* Loading Placeholder */}
          {loading && (
            <View className="mb-4 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
              {/* Response Header */}
              <View className="px-4 py-3 border-b border-gray-800 flex-row items-start justify-between">
                <View className="flex-1 flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-2 bg-yellow-500" />
                  <Text className="text-gray-400 text-xs flex-1">
                    Processing...
                  </Text>
                </View>
              </View>

              {/* Prompt Section */}
              <View className="px-4 py-3 bg-gray-900/50">
                <Text className="text-xs text-gray-500 mb-1">Your Prompt:</Text>
                <Text className="text-gray-300 text-sm">{prompt}</Text>
              </View>

              {/* Placeholder Response Content */}
              <View className="px-4 py-3">
                <View>
                  <Text className="text-xs text-gray-400 mb-2">Response:</Text>
                  <View className="bg-black rounded px-2 py-2">
                    <Text className="text-gray-400 text-sm leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                    <Text className="text-gray-400 text-sm leading-relaxed mt-2">
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Loading Indicator */}
              <View className="px-4 py-3 border-t border-gray-800 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-400 text-sm ml-2">Generating response...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Error Message */}
        {error && (
          <View className="mx-4 mb-2 p-3 bg-red-900/20 border border-red-800 rounded flex-row items-start"
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Error: ${error}`}
          >
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text className="text-red-300 text-sm flex-1 ml-2">{error}</Text>
          </View>
        )}

        {/* Input Section with Keyboard Avoidance */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
          className="border-t border-gray-800 bg-gray-950"
        >
          <View className="p-4" style={{ paddingHorizontal: contentPadding }}>
          {/* Quick Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 -mx-4 px-4"
          >
            <TouchableOpacity
              onPress={() => setPrompt('Summarize this note in 3 bullet points')}
              className="bg-gray-800 rounded-full px-3 py-2 mr-2 flex-row items-center"
              accessibilityLabel="Summarize action"
              accessibilityRole="button"
            >
              <Ionicons name="list" size={16} color="#3B82F6" />
              <Text className="text-white text-xs ml-1 font-medium">Summarize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPrompt('Generate 3 actionable ideas from this note')}
              className="bg-gray-800 rounded-full px-3 py-2 mr-2 flex-row items-center"
              accessibilityLabel="Ideas action"
              accessibilityRole="button"
            >
              <Ionicons name="bulb" size={16} color="#FBBF24" />
              <Text className="text-white text-xs ml-1 font-medium">Ideas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPrompt('Improve the grammar and clarity of this note')}
              className="bg-gray-800 rounded-full px-3 py-2 mr-2 flex-row items-center"
              accessibilityLabel="Polish action"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-done" size={16} color="#10B981" />
              <Text className="text-white text-xs ml-1 font-medium">Polish</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Input Area */}
          <View className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask AI to help with your note..."
              placeholderTextColor="#6B7280"
              className="text-white text-base px-4 py-3 min-h-12"
              multiline
              maxLength={500}
              editable={!loading}
              accessibilityLabel="AI prompt input"
              accessibilityHint="Enter your request for the AI assistant"
            />
          </View>

          {/* Character Count */}
          <Text className="text-gray-500 text-xs mt-2">
            {prompt.length}/500
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={handleSubmitPrompt}
              disabled={loading || !prompt.trim()}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                loading || !prompt.trim()
                  ? 'bg-gray-700 opacity-50'
                  : 'bg-blue-600'
              }`}
              accessibilityLabel="Send prompt"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading || !prompt.trim() }}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">
                    Processing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">Send</Text>
                </>
              )}
            </TouchableOpacity>

            {responses.length > 0 && (
              <TouchableOpacity
                onPress={handleClearHistory}
                disabled={loading}
                className="px-4 py-3 rounded-lg bg-gray-800"
                accessibilityLabel="Clear history"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Info Text */}
          <Text className="text-gray-500 text-xs mt-3 text-center">
            AI uses your note content to provide relevant suggestions
          </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Animated.View>
  );
};

export default AIToolsSection;
