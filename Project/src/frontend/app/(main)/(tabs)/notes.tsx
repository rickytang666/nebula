import React, { useState, useMemo, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Note, SortOption } from '../../../types/note';
import { SAMPLE_NOTES } from '../../../data/sampleNotes';
import { filterNotesBySearch, sortNotes } from '../../../utils/noteUtils';
import NotesHeader from '../../../components/NotesHeader';
import SearchBar from '../../../components/SearchBar';
import SortControls from '../../../components/SortControls';
import NoteCard from '../../../components/NoteCard';
import NoteCardSkeleton from '../../../components/NoteCardSkeleton';

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

  // Calculate responsive padding
  const horizontalPadding = useMemo(() => {
    if (width >= 1024) return 32; // 8 * 4
    if (width >= 768) return 24; // 6 * 4
    return 24; // 6 * 4 (default)
  }, [width]);

  // State management for notes list
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [notes] = useState<Note[]>(SAMPLE_NOTES);
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered and sorted notes using useMemo for performance
  const displayedNotes = useMemo(() => {
    const filtered = filterNotesBySearch(notes, searchQuery);
    return sortNotes(filtered, sortBy);
  }, [notes, searchQuery, sortBy]);

  // Event handlers with useCallback for optimization
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const handleNotePress = useCallback((noteId: string) => {
    // Navigate to note detail screen with note ID
    // Note: This route will be available once task 5 is implemented
    router.push(`/(main)/note/${noteId}` as any);
  }, [router]);

  const handleNewNote = useCallback(() => {
    // Navigate to note creation screen
    // Note: This route will be available once task 5 is implemented
    router.push('/(main)/note/new' as any);
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, handle potential errors from API
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
        <NotesHeader onNewNote={handleNewNote} />

        {/* Search bar */}
        <View className="mb-4">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search notes..."
          />
        </View>

        {/* Sort controls */}
        <View className="mb-4">
          <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
        </View>

        {/* Notes grid with responsive column layout */}
        <FlatList
          data={displayedNotes}
          renderItem={renderNoteCard}
          keyExtractor={(item) => item.id}
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
