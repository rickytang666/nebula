import React, { memo, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { Note } from '../types/note';
import { formatRelativeTime } from '../utils/noteUtils';

interface NoteCardProps {
  note: Note;
  onPress: (noteId: string) => void;
}

function NoteCard({ note, onPress }: NoteCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Fade in and scale animation when card mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Strip markdown formatting for preview
  const getContentPreview = (content: string): string => {
    return content
      .replace(/[#*_`~\[\]]/g, '') // Remove markdown symbols
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  const contentPreview = getContentPreview(note.content);
  const formattedDate = formatRelativeTime(note.updated_at);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <Pressable
      className="bg-gray-900 rounded-3xl p-4 border border-gray-800"
      style={{ minHeight: 160 }}
      onPress={() => onPress(note.id)}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      accessibilityLabel={`Note: ${note.title || 'Untitled Note'}`}
      accessibilityRole="button"
      accessibilityHint={`Opens note. Last updated ${formattedDate}. ${note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}` : ''}`}
    >
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.7 : 1 }}>
          {/* Title - truncated to 2 lines */}
          <Text
            className="text-white font-semibold text-lg mb-2"
            numberOfLines={2}
            ellipsizeMode="tail"
            accessibilityRole="header"
          >
            {note.title || 'Untitled Note'}
          </Text>

          {/* Content preview - truncated to 3 lines */}
          <Text
            className="text-gray-400 text-sm mb-3"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {contentPreview || 'No content'}
          </Text>

          {/* Date */}
          <Text className="text-gray-500 text-xs mb-2">
            {formattedDate}
          </Text>

          {/* Tags - horizontal scrollable chips */}
          {note.tags && note.tags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
              accessibilityLabel={`Tags: ${note.tags.join(', ')}`}
            >
              {note.tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  className="bg-gray-800 rounded-full px-3 mr-2"
                  style={{ minHeight: 28, justifyContent: 'center' }}
                >
                  <Text className="text-gray-300 text-xs">
                    {tag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </Pressable>
    </Animated.View>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(NoteCard, (prevProps, nextProps) => {
  // Only re-render if note data or onPress function changes
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.updated_at === nextProps.note.updated_at &&
    prevProps.note.tags.length === nextProps.note.tags.length &&
    prevProps.onPress === nextProps.onPress
  );
});
