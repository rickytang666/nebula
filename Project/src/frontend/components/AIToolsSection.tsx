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
import { Sparkles, X, Copy, List, Lightbulb, CheckCheck, Send, AlertCircle } from 'lucide-react-native';
import MarkdownRenderer from './MarkdownRenderer';
import useAIService from '../hooks/useAIService';

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
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);
  
  const { loading, error, processPrompt } = useAIService();

  const { width } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const contentPadding = width >= 768 ? 32 : 16;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  useEffect(() => {
    if (responses.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [responses]);

  const handleSubmitPrompt = useCallback(async () => {
    if (!prompt.trim()) return;

    const userPrompt = prompt.trim();
    setPrompt('');

    const result = await processPrompt({
      noteTitle,
      noteContent,
      userPrompt,
    });

    if (result) {
      const newResponse: AIResponse = {
        id: Date.now().toString(),
        prompt: userPrompt,
        response: result.result,
        timestamp: result.processedAt,
        type: 'success',
      };
      setResponses((prev) => [...prev, newResponse]);
    }
  }, [prompt, noteTitle, noteContent, processPrompt]);

  const handleCopyResponse = useCallback((text: string) => {
    Alert.alert('Copied', 'Response copied to clipboard');
  }, []);

  return (
    <Animated.View
      style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}
      className="bg-base-100"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between py-4 border-b border-base-300 bg-base-100" style={{ paddingHorizontal: contentPadding }}>
        <View className="flex-row items-center">
          <Sparkles size={20} color="#3b82f6" fill="#3b82f6" />
          <Text className="text-base-content text-lg font-bold font-inter ml-2">AI Assistant</Text>
        </View>
        <TouchableOpacity onPress={onClose} className="p-2 -mr-2 rounded-full hover:bg-base-200">
          <X size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-col">
        {/* Responses List */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-base-100"
          contentContainerStyle={{ paddingHorizontal: contentPadding, paddingTop: 16, paddingBottom: 16 }}
        >
          {responses.length === 0 && (
            <View className="flex-1 items-center justify-center py-20 opacity-50">
              <Sparkles size={48} color="#94a3b8" />
              <Text className="text-base-content/60 text-center mt-4 font-inter">Ask Gemini about your note</Text>
            </View>
          )}

          {responses.map((response) => (
            <View key={response.id} className="mb-6 space-y-3">
              {/* User Message */}
              <View className="self-end bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] border border-primary/20">
                <Text className="text-base-content font-inter text-sm leading-5">{response.prompt}</Text>
              </View>

              {/* Gemini Message */}
              <View className="self-start w-full bg-base-200 rounded-2xl rounded-tl-sm px-4 py-4 border border-base-300">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center space-x-2">
                    <Sparkles size={14} color="#3b82f6" />
                    <Text className="text-xs text-base-content/50 font-inter font-bold uppercase tracking-wider">Gemini</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCopyResponse(response.response)} className="p-1">
                    <Copy size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <View className="bg-transparent">
                  <MarkdownRenderer content={response.response} />
                </View>
              </View>
            </View>
          ))}

          {loading && (
            <View className="mb-4 p-4 flex-row items-center bg-base-200/50 rounded-2xl self-start">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-base-content/60 text-sm ml-3 font-inter italic">Thinking...</Text>
            </View>
          )}

          {error && (
            <View className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl flex-row items-center">
              <AlertCircle size={20} color="#f87171" />
              <Text className="text-error text-sm flex-1 ml-2 font-inter">{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0} className="border-t border-base-300 bg-base-100">
          <View className="p-4 space-y-3" style={{ paddingHorizontal: contentPadding }}>
            
            {/* Quick Actions */}
            <ScrollView horizontal className="-mx-4 px-4" showsHorizontalScrollIndicator={false}>
              {[
                { label: 'Summarize', icon: List, text: 'Summarize this note in 3 bullet points' },
                { label: 'Ideas', icon: Lightbulb, text: 'Generate 3 actionable ideas from this note' },
                { label: 'Polish', icon: CheckCheck, text: 'Improve the grammar and clarity of this note' }
              ].map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setPrompt(action.text)}
                  className="bg-base-200 border border-base-300 rounded-full px-4 py-2 mr-2 flex-row items-center active:bg-base-300"
                >
                  <action.icon size={14} color="#3b82f6" />
                  <Text className="text-base-content/80 text-xs ml-1.5 font-bold font-inter">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Input Field */}
            <View className="bg-base-200 rounded-2xl border border-base-300 flex-row items-center pr-2 shadow-sm">
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Ask something..."
                placeholderTextColor="#94a3b8"
                className="text-base-content text-base px-5 py-4 flex-1 font-inter min-h-[56px] min-w-0" // min-w-0 for flex
                multiline
                maxLength={500}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={handleSubmitPrompt} 
                disabled={loading || !prompt.trim()}
                className={`p-2 rounded-xl transition-all ${loading || !prompt.trim() ? 'bg-transparent' : 'bg-primary shadow-sm shadow-blue-500/30'}`}
              >
                <Send size={20} color={loading || !prompt.trim() ? "#cbd5e1" : "#ffffff"} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Animated.View>
  );
};

export default AIToolsSection;