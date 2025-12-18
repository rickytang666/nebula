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
        className="bg-base-200 rounded-2xl p-5 border border-base-300"
        style={{ minHeight: 160 }}
        onPress={() => onPress(note.id)}
        android_ripple={{ color: 'rgba(59, 130, 246, 0.1)' }} // Blue 500 ripple
        accessibilityLabel={`Note: ${note.title || 'Untitled Note'}`}
        accessibilityRole="button"
        accessibilityHint={`Opens note. Last updated ${formattedDate}.`} // Updated hint to use formatDate
      >
        {/* Removed the outer {({ pressed }) => ... } wrapper as the new structure doesn't use it */}
        <View>
          <Text
            className="text-base-content text-lg font-bold font-inter mb-2 leading-tight" // Updated font-semibold to font-bold
            numberOfLines={1} // Changed to 1 line
            ellipsizeMode="tail"
            accessibilityRole="header"
          >
            {note.title || 'Untitled Note'}
          </Text>

          <Text
            className="text-base-content/30 text-sm font-inter leading-relaxed" // Changed /70 to /40
            numberOfLines={4} // Changed to 4 lines
            ellipsizeMode="tail"
          >
            {note.content || 'No content...'} {/* Used note.content directly */}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-auto pt-4">
          <Text className="text-primary/80 text-xs font-inter">
            {formattedDate}
          </Text>
        </View>
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
    prevProps.onPress === nextProps.onPress
  );
});
