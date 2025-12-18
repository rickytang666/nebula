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
import { ArrowLeft, Sparkle, Check, Pencil, Trash2 } from 'lucide-react-native';
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
        setIsEditMode(true);
      } else {
        try {
          const localData = await AsyncStorage.getItem(`note_draft_${id}`);
          if (localData) {
            const draft = JSON.parse(localData);
            setTitle(draft.title);
            setContent(draft.content);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }

        const existingNote = await getNoteById(id);
        if (existingNote) {
          setNote(existingNote);
          if (!title && !content) {
            setTitle(existingNote.title);
            setContent(existingNote.content);
          }
          setIsEditMode(false);
        } else {
          Alert.alert(
            'Note Not Found',
            'The note you are looking for could not be found.',
            [{ text: 'OK', onPress: () => router.replace('/(app)/(tabs)/notes') }]
          );
        }
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    loadNote();
  }, [id, fadeAnim, router]);

  // Use ref to store latest values without triggering re-renders
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const isSavingRef = useRef(false);

  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  const saveNote = useCallback(async (retryCount = 0) => {
    if (!note) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const updatedNote: Note = {
        ...note,
        title: titleRef.current,
        content: contentRef.current,
        updated_at: new Date().toISOString(),
      };

      const savedNote = await saveNoteToStorage(updatedNote);
      setNote(savedNote);

      if (id === 'new') {
        router.setParams({ id: savedNote.id });
      }

      try {
        await AsyncStorage.removeItem(`note_draft_${note.id}`);
      } catch (error) {
        console.error('Error clearing draft:', error);
      }

      setIsDirty(false);
      setSaveStatus('saved');

      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }

      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveStatus('idle');

      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => saveNote(retryCount + 1), delay);
      } else {
        Alert.alert('Save Failed', 'Unable to save changes after multiple attempts.');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [note, id, router]);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    setIsDirty(true);
    if (note) {
      AsyncStorage.setItem(`note_draft_${note.id}`, JSON.stringify({
        title: text,
        content: contentRef.current,
        timestamp: new Date().toISOString(),
      })).catch(console.error);
    }
  }, [note]);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    setIsDirty(true);
    if (note) {
      AsyncStorage.setItem(`note_draft_${note.id}`, JSON.stringify({
        title: titleRef.current,
        content: text,
        timestamp: new Date().toISOString(),
      })).catch(console.error);
    }
  }, [note]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      saveNote();
    }
    router.back();
  }, [isDirty, saveNote, router]);

  const toggleAIMode = useCallback(() => {
    setAiModalVisible(!aiModalVisible);
  }, [aiModalVisible]);

  const toggleEditMode = useCallback(() => {
    if (isEditMode && isDirty) {
      saveNote();
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, isDirty, saveNote]);

  const handleDelete = useCallback(async () => {
    const performDelete = async () => {
      try {
        if (note?.id) {
          await deleteNoteFromStorage(note.id);
          await AsyncStorage.removeItem(`note_draft_${note.id}`);
          router.replace('/(app)/(tabs)/notes');
        }
      } catch (error) {
        Alert.alert('Delete Failed', 'Unable to delete note.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this note?')) performDelete();
    } else {
      Alert.alert(
        'Delete Note',
        'Are you sure you want to delete this note?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  }, [note, router]);

  useEffect(() => {
    if (!note || !isEditMode) return;
    autoSaveIntervalRef.current = setInterval(() => {
      if (isDirty) saveNote();
    }, 30000);
    return () => {
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, [note, isEditMode, isDirty, saveNote]);

  useEffect(() => {
    return () => {
      if (isDirty) saveNote();
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    };
  }, [isDirty, saveNote]);

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-base-100 items-center justify-center">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <Text className="text-base-content/50">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-base-100" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between py-4 border-b border-base-300"
            style={{ paddingHorizontal: contentPadding }}
          >
            <TouchableOpacity
              onPress={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-base-200"
            >
              <ArrowLeft size={24} color="#94a3b8" />
            </TouchableOpacity>

            <View className="flex-row items-center space-x-1">
              {/* Save Status */}
              {isEditMode && saveStatus !== 'idle' && (
                <View className="flex-row items-center mr-3">
                  {saveStatus === 'saving' ? (
                    <Text className="text-base-content/40 text-xs">Saving...</Text>
                  ) : (
                    <Text className="text-base-content/40 text-xs">Saved</Text>
                  )}
                </View>
              )}

              {/* AI Tools */}
              <TouchableOpacity
                onPress={toggleAIMode}
                className="p-2 rounded-xl hover:bg-primary/10 active:bg-primary/20"
              >
                <Sparkle size={20} color="#60a5fa" />
              </TouchableOpacity>

              {/* Edit/Preview Toggle */}
              <TouchableOpacity
                onPress={toggleEditMode}
                className={`p-2 rounded-xl ${isEditMode ? 'bg-primary/10' : 'hover:bg-base-200'}`}
              >
                {isEditMode ? (
                  <Check size={20} color="#3b82f6" />
                ) : (
                  <Pencil size={20} color="#94a3b8" />
                )}
              </TouchableOpacity>

              {/* Delete */}
              {id !== 'new' && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-2 rounded-xl hover:bg-error/10 active:bg-error/20"
                >
                  <Trash2 size={20} color="#f87171" />
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
            {/* Title */}
            {isEditMode ? (
              <TextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Note title"
                placeholderTextColor="#64748b"
                className="text-base-content text-3xl font-bold py-6 border-b border-base-300"
                multiline
              />
            ) : (
              <View>
                <Text className="text-base-content text-3xl font-bold py-6 border-b border-base-300">
                  {title || 'Untitled Note'}
                </Text>
              </View>
            )}

            {/* Content Editor */}
            {isEditMode ? (
              <TextInput
                value={content}
                onChangeText={handleContentChange}
                placeholder="Start writing..."
                placeholderTextColor="#64748b"
                className="text-base-content text-sm leading-7 py-6 font-mono"
                multiline
                textAlignVertical="top"
                style={{ minHeight: 300 }}
                scrollEnabled={false}
              />
            ) : (
              <View style={{ minHeight: 500 }}>
                <View style={{ paddingTop: 24, paddingBottom: 60 }}>
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <Text className="text-base-content/40 text-base italic">
                      Tap the edit button to start writing...
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      <AIToolsModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        noteContent={content}
        noteTitle={title}
      />
    </SafeAreaView>
  );
}
