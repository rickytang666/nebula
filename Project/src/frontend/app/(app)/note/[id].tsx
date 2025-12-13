import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AIToolsModal from '@/components/AIToolsModal';
import { Note } from '@/types/note';
import { getNoteById, saveNote as saveNoteToStorage, deleteNote as deleteNoteFromStorage } from '@/utils/noteStorage';

export default function NoteDetailScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams<{ id: string; initialContent?: string }>();
  const { id } = localParams;
  const { width } = useWindowDimensions();

  // Calculate responsive padding and max width
  const contentPadding = width >= 768 ? 48 : 24;
  const maxContentWidth = width >= 1024 ? 800 : width;

  // State management for note detail
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Refs for autosave and animations
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load note data based on route parameter
  useEffect(() => {
    const loadNote = async () => {
      if (id === 'new') {
        // Handle new note creation - start in edit mode

        // Check for initialContent from OCR
        const contentToUse = localParams.initialContent || '';

        const newNote: Note = {
          id: Date.now().toString(),
          title: '',
          content: contentToUse,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setNote(newNote);
        setTitle('');
        setContent(contentToUse);
        setIsEditMode(true); // Auto-enable edit mode for new notes
      } else {
        // Try to load from local storage first
        try {
          const localData = await AsyncStorage.getItem(`note_draft_${id}`);
          if (localData) {
            const draft = JSON.parse(localData);
            setTitle(draft.title);
            setContent(draft.content);
            console.log('Loaded draft from local storage');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }

        // Load existing note - start in read-only mode
        const existingNote = await getNoteById(id);
        if (existingNote) {
          setNote(existingNote);
          // Only set title/content/tags if no draft was loaded
          if (!title && !content) {
            setTitle(existingNote.title);
            setContent(existingNote.content);
          }
          setIsEditMode(false); // Start in read-only mode
        } else {
          // Note not found - show error and navigate to notes list
          Alert.alert(
            'Note Not Found',
            'The note you are looking for could not be found. It may have been deleted.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(app)/(tabs)/notes'),
              },
            ]
          );
        }
      }

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    loadNote();
  }, [id, fadeAnim, router]);

  // Save to local storage immediately on change (silently, no UI indicator)
  const saveToLocalStorage = useCallback(async () => {
    if (!note) return;

    try {
      const draft = {
        title,
        content,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`note_draft_${note.id}`, JSON.stringify(draft));
      // Silent save - no status update, no setSaveStatus call
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }, [note, title, content]);

  // Use ref to store latest values without triggering re-renders
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const isSavingRef = useRef(false);

  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  // Save note function with retry logic (uses refs to avoid recreating on every keystroke)
  const saveNote = useCallback(async (retryCount = 0) => {
    if (!note) return;

    // Prevent concurrent saves using ref for immediate locking
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Simulate save operation
      // await new Promise(resolve => setTimeout(resolve, 500)); // Removed artificial delay

      // Update note with new data using refs for latest values
      const updatedNote: Note = {
        ...note,
        title: titleRef.current,
        content: contentRef.current,
        updated_at: new Date().toISOString(),
      };

      // Save to storage
      const savedNote = await saveNoteToStorage(updatedNote);
      console.log('Note saved:', savedNote);

      // Update local state with the saved note (important for new notes to get real ID)
      setNote(savedNote);

      // If this was a new note, update the URL/route params so it's no longer "new"
      if (id === 'new') {
        router.setParams({ id: savedNote.id });
        console.log('Updated route params to:', savedNote.id);
      }

      // Clear local storage draft after successful save
      try {
        await AsyncStorage.removeItem(`note_draft_${note.id}`);
        console.log('Cleared local storage draft');
      } catch (error) {
        console.error('Error clearing draft:', error);
      }

      setIsDirty(false);
      setSaveStatus('saved');

      // Clear any existing timeout
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }

      // Hide "Saved" indicator after 2 seconds
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveStatus('idle');

      // Retry logic with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          saveNote(retryCount + 1);
        }, delay);
        Alert.alert(
          'Save Failed',
          `Unable to save changes. Retrying in ${delay / 1000} seconds...`,
          [{ text: 'OK' }]
        );
      } else {
        // After 3 retries, give user options
        Alert.alert(
          'Save Failed',
          'Unable to save changes after multiple attempts. Your changes are kept in memory.',
          [
            {
              text: 'Copy Content',
              onPress: () => {
                // In a real app, copy to clipboard
                console.log('Content copied to clipboard');
              },
            },
            {
              text: 'Try Again',
              onPress: () => saveNote(0),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [note, id, router]); // Added id and router to dependencies

  // Handle title change
  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    setIsDirty(true);
    // Save to local storage silently (no status indicator)
    if (note) {
      AsyncStorage.setItem(`note_draft_${note.id}`, JSON.stringify({
        title: text,
        content: contentRef.current,
        timestamp: new Date().toISOString(),
      })).catch(err => console.error('Error saving draft:', err));
    }
  }, [note]);

  // Handle content change
  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    setIsDirty(true);
    // Save to local storage silently (no status indicator)
    if (note) {
      AsyncStorage.setItem(`note_draft_${note.id}`, JSON.stringify({
        title: titleRef.current,
        content: text,
        timestamp: new Date().toISOString(),
      })).catch(err => console.error('Error saving draft:', err));
    }
  }, [note]);



  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isDirty) {
      // Save before navigating away
      saveNote();
    }
    router.back();
  }, [isDirty, saveNote, router]);

  const toggleAIMode = useCallback(() => {
    setAiModalVisible(!aiModalVisible);
  }, [aiModalVisible]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (isEditMode && isDirty) {
      // Save when exiting edit mode
      saveNote();
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, isDirty, saveNote]);

  // Handle delete with error handling
  const handleDelete = useCallback(async () => {
    console.log('Delete button pressed');

    const performDelete = async () => {
      console.log('Delete confirmed');
      try {
        if (note?.id) {
          console.log('Deleting note:', note.id);
          await deleteNoteFromStorage(note.id);
          // Clear draft as well
          await AsyncStorage.removeItem(`note_draft_${note.id}`);
          console.log('Note deleted successfully');
          router.replace('/(app)/(tabs)/notes');
        } else {
          console.error('No note ID to delete');
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
        // Show error alert (works fine on web usually for simple messages, or use window.alert)
        if (Platform.OS === 'web') {
          window.alert('Unable to delete note. Please try again.');
        } else {
          Alert.alert(
            'Delete Failed',
            'Unable to delete note. Please try again.',
            [
              { text: 'Try Again', onPress: () => handleDelete() },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete this note? This action cannot be undone.'
      );
      if (confirmed) {
        await performDelete();
      } else {
        console.log('Delete cancelled');
      }
    } else {
      Alert.alert(
        'Delete Note',
        'Are you sure you want to delete this note? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Delete cancelled'),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  }, [note, router]);

  // Set up 30-second autosave interval
  useEffect(() => {
    if (!note || !isEditMode) return;

    // Save every 30 seconds
    autoSaveIntervalRef.current = setInterval(() => {
      if (isDirty) {
        console.log('Auto-saving (30s interval)...');
        saveNote();
      }
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [note, isEditMode, isDirty, saveNote]);

  // Save on unmount if dirty and cleanup
  useEffect(() => {
    return () => {
      if (isDirty) {
        // Force immediate save on unmount
        saveNote();
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isDirty, saveNote]);

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View
          className="flex-1 items-center justify-center"
          accessibilityLabel="Loading note"
          accessibilityRole="progressbar"
        >
          <Text className="text-gray-400">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header with back button and actions */}
          <View
            className="flex-row items-center justify-between py-4 border-b border-gray-800"
            style={{ paddingHorizontal: contentPadding }}
          >
            <TouchableOpacity
              onPress={handleBack}
              className="p-2"
              style={{ minWidth: 44, minHeight: 44 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              {/* Save indicator - only show when actively saving or just saved */}
              {isEditMode && saveStatus !== 'idle' && (
                <View
                  className="flex-row items-center mr-4"
                  accessibilityLabel={saveStatus === 'saving' ? "Saving note" : "Note saved"}
                  accessibilityLiveRegion="polite"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Text className="text-gray-400 text-sm mr-2">Saving...</Text>
                      <View className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </>
                  ) : (
                    <Text className="text-gray-500 text-sm">Saved</Text>
                  )}
                </View>
              )}

              {/* AI button */}
              <TouchableOpacity
                onPress={toggleAIMode}
                className="p-2 mr-2"
                style={{ minWidth: 44, minHeight: 44 }}
                accessibilityLabel="Toggle AI mode"
                accessibilityRole="button"
              >
                <Ionicons
                  name="sparkles"
                  size={24}
                  color="#FFFFFF"
                />

              </TouchableOpacity>

              {/* Edit/Done button */}
              <TouchableOpacity
                onPress={toggleEditMode}
                className="p-2 mr-2"
                style={{ minWidth: 44, minHeight: 44 }}
                accessibilityLabel={isEditMode ? "Done editing" : "Edit note"}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isEditMode ? "checkmark" : "create-outline"}
                  size={24}
                  color={isEditMode ? "#3B82F6" : "#FFFFFF"}
                />
              </TouchableOpacity>

              {/* Delete button */}
              {id !== 'new' && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-2"
                  style={{ minWidth: 44, minHeight: 44 }}
                  accessibilityLabel="Delete note"
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: contentPadding,
              maxWidth: maxContentWidth,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            {/* Title - editable or read-only based on mode */}
            {isEditMode ? (
              <TextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Note title"
                placeholderTextColor="#6B7280"
                className="text-white text-3xl font-bold py-4 border-b border-gray-800"
                multiline
                accessibilityLabel="Note title"
                accessibilityHint="Enter the title for your note"
              />
            ) : (
              <TouchableOpacity onPress={toggleEditMode} activeOpacity={0.7}>
                <Text className="text-white text-3xl font-bold py-4 border-b border-gray-800">
                  {title || 'Untitled Note'}
                </Text>
              </TouchableOpacity>
            )}



            {/* Content - editable or read-only based on mode */}
            {isEditMode ? (
              <TextInput
                value={content}
                onChangeText={handleContentChange}
                placeholder="Start writing... (Supports Markdown and LaTeX with $ or $$)"
                placeholderTextColor="#6B7280"
                className="text-white text-base leading-relaxed py-6"
                multiline
                textAlignVertical="top"
                style={{ minHeight: 400 }}
                accessibilityLabel="Note content"
                accessibilityHint="Enter the content for your note. Supports markdown and LaTeX formatting."
              />
            ) : (
              <TouchableOpacity onPress={toggleEditMode} activeOpacity={0.7} style={{ minHeight: 400 }}>
                <View style={{ paddingTop: 24, paddingBottom: 24 }}>
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <Text className="text-gray-500 text-base">No content</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* AI Tools Modal */}
      <AIToolsModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        noteContent={content}
        noteTitle={title}
      />
    </SafeAreaView>
  );
}
