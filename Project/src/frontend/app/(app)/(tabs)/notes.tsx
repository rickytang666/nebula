import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StatusBar,
  RefreshControl,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { getAllNotes, initializeNotes, generateEmbeddingsForAllNotes } from '@/utils/noteStorage';
import { filterNotesBySearch, sortNotes } from '@/utils/noteUtils';
import NotesHeader from '@/components/NotesHeader';
import SearchBar from '@/components/SearchBar';
import SortControls from '@/components/SortControls';
import NoteCard from '@/components/NoteCard';
import NoteCardSkeleton from '@/components/NoteCardSkeleton';
import { Note, SortOption, SemanticSearchResult } from '@/types/note';

import { API_URL } from '@/constants/env';

export default function NotesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Calculate number of columns based on screen width
  // Mobile: 2 columns (< 768px)
  // Tablet: 3 columns (768px - 1024px)
  // Desktop: 4 columns (> 1024px)
  const numColumns = useMemo(() => {
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 2;
  }, [width]);

  // Calculate responsive paddings
  const horizontalPadding = useMemo(() => {
    if (width >= 1024) return 32; // 8 * 4
    if (width >= 768) return 24; // 6 * 4
    return 24; // 6 * 4 (default)
  }, [width]);

  // State management for notes list
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]); // Keep for reference if needed, or remove
  const [semanticMatchedNotes, setSemanticMatchedNotes] = useState<Note[]>([]);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Load notes on mount
  useEffect(() => {
    if (session) {
      //      clearEmbeddingsFlag(); // Add before initializeEmbeddings()
      loadNotes();
      initializeEmbeddings();
    }
  }, [session]);

  // Initialize embeddings for existing notes (one-time operation)
  const initializeEmbeddings = async () => {
    try {
      const EMBEDDINGS_INITIALIZED_KEY = 'embeddings_initialized';
      const initialized = await AsyncStorage.getItem(EMBEDDINGS_INITIALIZED_KEY);

      if (!initialized) {
        console.log('[Embeddings] Generating embeddings for all notes...');
        await generateEmbeddingsForAllNotes();
        await AsyncStorage.setItem(EMBEDDINGS_INITIALIZED_KEY, 'true');
        console.log('[Embeddings] Successfully initialized embeddings');
      } else {
        console.log('[Embeddings] Already initialized, skipping');
      }
    } catch (error) {
      console.error('[Embeddings] Failed to initialize embeddings:', error);
      // Don't show error to user, embeddings will be generated on next note update
    }
  };

  // Temporary: Clear embeddings flag to force re-initialization
  // Remove this after testing
  const clearEmbeddingsFlag = async () => {
    try {
      await AsyncStorage.removeItem('embeddings_initialized');
      console.log('[Embeddings] Flag cleared, will re-initialize on next load');
    } catch (error) {
      console.error('[Embeddings] Failed to clear flag:', error);
    }
  };

  // Reload notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session) {
        loadNotes();
      }
    }, [session])
  );

  const loadNotes = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const loadedNotes = await getAllNotes();
      if (loadedNotes.length === 0) {
        // Initialize with sample notes if empty
        const initialized = await initializeNotes();
        setNotes(initialized);
      } else {
        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered and sorted notes using useMemo for performance
  const displayedNotes = useMemo(() => {
    // Use submittedQuery for filtering instead of searchQuery
    const filtered = filterNotesBySearch(notes, submittedQuery);
    return sortNotes(filtered, sortBy);
  }, [notes, submittedQuery, sortBy]);


  // Event handlers with useCallback for optimization
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    // Clear results if text is empty, but don't auto-search
    if (text.length === 0) {
      setSubmittedQuery('');
      setSemanticResults([]);
      setSemanticMatchedNotes([]);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.length === 0) return;

    if (isSemanticSearch) {
      performSemanticSearch(searchQuery);
    } else {
      setSubmittedQuery(searchQuery);
      setSemanticMatchedNotes([]); // Clear semantic results if switching to regular search
    }
  }, [searchQuery, isSemanticSearch]);

  const performSemanticSearch = async (query: string) => {
    try {
      setIsSearchingSemantic(true);
      console.log('[Semantic Search] Starting search for:', query);

      const response = await api.embeddings.search(query);
      console.log('[Semantic Search] API response:', response);

      const results = response.results || [];
      console.log('[Semantic Search] Results count:', results.length);
      console.log('[Semantic Search] Results:', results);

      // Extract unique note IDs from results
      const uniqueNoteIds = Array.from(new Set(results.map((r: SemanticSearchResult) => r.note_id)));
      console.log('[Semantic Search] Unique note IDs from results:', uniqueNoteIds);
      console.log('[Semantic Search] Currently loaded notes:', notes.length);
      console.log('[Semantic Search] Loaded note IDs:', notes.map(n => n.id));

      // Filter local notes to find matches
      // Note: This assumes all notes are already loaded in 'notes' state.
      // If we have pagination, we might need to fetch these notes from backend.
      // For MVP, we'll use loaded notes.
      const matchedNotes = notes.filter(note => uniqueNoteIds.includes(note.id));
      console.log('[Semantic Search] Matched notes count:', matchedNotes.length);
      console.log('[Semantic Search] Matched notes:', matchedNotes);

      // Sort matched notes by similarity (using the first chunk's similarity as proxy)
      // We create a map of note_id -> max_similarity
      const similarityMap = new Map<string, number>();
      results.forEach((r: SemanticSearchResult) => {
        const current = similarityMap.get(r.note_id) || 0;
        if (r.similarity > current) {
          similarityMap.set(r.note_id, r.similarity);
        }
      });

      const sortedMatchedNotes = matchedNotes.sort((a, b) => {
        const simA = similarityMap.get(a.id) || 0;
        const simB = similarityMap.get(b.id) || 0;
        return simB - simA;
      });

      console.log('[Semantic Search] Setting matched notes:', sortedMatchedNotes.length);
      setSemanticMatchedNotes(sortedMatchedNotes);

    } catch (error) {
      console.error('Semantic search failed:', error);
      Alert.alert('Error', 'Failed to perform semantic search');
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  const handleToggleSemantic = useCallback((value: boolean) => {
    setIsSemanticSearch(value);
    // Clear results when switching modes
    setSemanticResults([]);
    setSubmittedQuery('');
    // Optional: Auto-trigger search if query exists? 
    // User requested "then they hit the button", so let's NOT auto-trigger.
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const handleNotePress = useCallback((noteId: string) => {
    // Navigate to note detail screen with note ID
    // Note: This route will be available once task 5 is implemented
    router.push(`/(app)/note/${noteId}` as any);
  }, [router]);

  const handleCreateNote = () => {
    // Navigate to new note creation
    // We'll use a modal or a separate screen
    router.push('/(app)/note/new' as any);
  };

  const handleScanPress = useCallback(() => {
    Alert.alert(
      'Scan Note',
      'Choose an option to import a note',
      [
        {
          text: 'Take Photo',
          onPress: () => processImage(true),
        },
        {
          text: 'Choose from Library',
          onPress: () => processImage(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, []);

  const processImage = async (useCamera: boolean) => {
    try {
      setIsLoading(true); // Show loading indicator

      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: false, // We'll let file upload handle it or read it if needed? API expects file.
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Library permission is required to select photos.');
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Upload to backend
        const formData = new FormData();
        const uri = asset.uri;
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        // React Native FormData expects an object with uri, name, type
        formData.append('file', {
          uri: uri,
          name: filename,
          type: type,
        } as any);

        console.log('Sending image to OCR service...');
        // Note: You need to implement api.ocr.extract(formData)
        // Since api.ocr might not exist yet in your generated api wrapper, 
        // we'll assume a direct fetch or extending the api service.
        // For now, let's try to assume api.ocr exists or fetch directly.

        // Ideally: const response = await api.ocr.extract(formData);
        // Direct fetch backup;
        console.log('Using API URL for OCR:', API_URL);
        console.log('Full Endpoint:', `${API_URL}/ocr/extract`);

        const response = await fetch(`${API_URL}/ocr/extract`, {
          method: 'POST',
          body: formData,
          headers: {
            // 'Content-Type': 'multipart/form-data', // Let fetch set this automatically for FormData
          },
        });

        if (!response.ok) {
          throw new Error(`OCR failed with status: ${response.status}`);
        }

        const data = await response.json();
        const markdown = data.markdown;

        if (markdown) {
          router.push({
            pathname: '/(app)/note/new',
            params: { initialContent: markdown }
          } as any);
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Failed', 'Could not extract text from image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadNotes();
    } catch (error) {
      console.error('Failed to refresh notes:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh notes. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Render semantic result card
  const renderSemanticResult = useCallback(({ item }: { item: SemanticSearchResult }) => {
    const cardWidth = 100 / numColumns;
    // Find the original note to get the title if possible, or just show snippet
    const originalNote = notes.find(n => n.id === item.note_id);

    return (
      <View
        className="px-3 mb-4"
        style={{ width: `${cardWidth}%` }}
      >
        <View className="bg-gray-900 rounded-xl p-4 border border-blue-900/50 h-44">
          <Text className="text-blue-400 font-bold text-lg mb-2" numberOfLines={1}>
            {originalNote?.title || 'Note Fragment'}
          </Text>
          <Text className="text-gray-300 text-sm leading-5" numberOfLines={4}>
            {item.content}
          </Text>
          <View className="mt-auto flex-row justify-between items-center">
            <Text className="text-gray-500 text-xs">
              Match: {Math.round(item.similarity * 100)}%
            </Text>
            <Text className="text-gray-600 text-xs">
              Part {item.chunk_index + 1}/{item.total_chunks}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [numColumns, notes]);

  // Render skeleton loading cards
  const renderSkeletonCards = () => {
    const skeletonCount = numColumns * 3; // Show 3 rows of skeletons
    return (
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -12 }}>
        {Array.from({ length: skeletonCount }).map((_, index) => {
          const cardWidth = 100 / numColumns;
          return (
            <View
              key={`skeleton-${index}`}
              className="px-3 mb-4"
              style={{ width: `${cardWidth}%` }}
            >
              <NoteCardSkeleton />
            </View>
          );
        })}
      </View>
    );
  };

  // Render empty state when no notes exist
  const renderEmptyState = () => {
    if (isLoading) {
      return renderSkeletonCards();
    }

    if (searchQuery && displayedNotes.length === 0) {
      // No search results
      return (
        <View
          className="flex-1 items-center justify-center py-20"
          accessibilityLabel={`No notes found for ${searchQuery}`}
        >
          <Text className="text-gray-400 text-lg mb-2">No notes found</Text>
          <Text className="text-gray-500 text-sm">
            No results for "{searchQuery}"
          </Text>
        </View>
      );
    }

    if (notes.length === 0) {
      // No notes at all
      return (
        <View
          className="flex-1 items-center justify-center py-20"
          accessibilityLabel="No notes yet. Create your first note to get started"
        >
          <Text className="text-gray-400 text-lg mb-2">No notes yet</Text>
          <Text className="text-gray-500 text-sm">
            Create your first note to get started
          </Text>
        </View>
      );
    }

    return null;
  };

  // Render individual note card
  const renderNoteCard = useCallback(({ item }: { item: Note }) => {
    const cardWidth = 100 / numColumns;
    return (
      <View
        className="px-3 mb-4"
        style={{ width: `${cardWidth}%` }}
      >
        <NoteCard note={item} onPress={handleNotePress} />
      </View>
    );
  }, [handleNotePress, numColumns]);

  // Calculate item layout for FlatList optimization
  // Each card has: minHeight 160px + padding 16px (mb-4) = 176px per row
  const getItemLayout = useCallback((data: any, index: number) => {
    const ITEM_HEIGHT = 176; // Card height + margin
    const rowIndex = Math.floor(index / numColumns);
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * rowIndex,
      index,
    };
  }, [numColumns]);

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View className="flex-1 pt-4" style={{ paddingHorizontal: horizontalPadding }}>
        {/* Header with title and New Note button */}
        <NotesHeader onNewNote={handleCreateNote} onScan={handleScanPress} />

        <View className="mb-4 flex-row items-center space-x-2">
          <View className="flex-1">
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSearch={handleSearchSubmit}
              placeholder={isSemanticSearch ? "Search by meaning..." : "Search notes..."}
              isSemantic={isSemanticSearch}
              onToggleSemantic={handleToggleSemantic}
            />
          </View>
          <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
        </View>

        {/* Notes grid with responsive column layout */}
        <FlatList
          data={isSemanticSearch ? semanticMatchedNotes : displayedNotes}
          renderItem={renderNoteCard}
          keyExtractor={(item: any) => item.id}
          key={`grid-${numColumns}`}
          numColumns={numColumns}
          columnWrapperStyle={{ marginHorizontal: -12 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
              accessibilityLabel="Pull to refresh notes"
            />
          }
          // Performance optimizations
          getItemLayout={getItemLayout}
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          // Accessibility
          accessibilityLabel={`Notes list. ${displayedNotes.length} ${displayedNotes.length === 1 ? 'note' : 'notes'} displayed`}
          accessibilityRole="list"
        />
      </View>
    </SafeAreaView>
  );
}
