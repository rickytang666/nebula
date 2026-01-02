import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StatusBar,
  RefreshControl,
  Text,
  useWindowDimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  getAllNotes,
  initializeNotes,
  generateEmbeddingsForAllNotes,
} from "@/utils/noteStorage";
import { filterNotesBySearch, sortNotes } from "@/utils/noteUtils";
import NotesHeader from "@/features/notes/components/NotesHeader";
import SearchBar from "@/features/notes/components/SearchBar";
import SortControls from "@/features/notes/components/SortControls";
import NoteCard from "@/features/notes/components/NoteCard";
import NoteCardSkeleton from "@/features/notes/components/NoteCardSkeleton";
import { Note, SortOption, SemanticSearchResult } from "@/types/note";

import { API_URL } from "@/constants/env";

export default function NotesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 2;
  }, [width]);

  // Calculate responsive paddings
  const horizontalPadding = useMemo(() => {
    if (width >= 1024) return 32;
    if (width >= 768) return 24;
    return 24;
  }, [width]);

  // State management for notes list
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  // Using _ prefix to ignore unused variable warning if value is unused
  const [, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [semanticMatchedNotes, setSemanticMatchedNotes] = useState<Note[]>([]);
  const [, setIsSearchingSemantic] = useState(false);

  // --- Actions wrapped in useCallback to avoid exhaustive-deps warnings ---

  const initializeEmbeddings = useCallback(async () => {
    try {
      const EMBEDDINGS_INITIALIZED_KEY = "embeddings_initialized";
      const initialized = await AsyncStorage.getItem(
        EMBEDDINGS_INITIALIZED_KEY
      );

      if (!initialized) {
        console.log("[Embeddings] Generating embeddings for all notes...");
        await generateEmbeddingsForAllNotes();
        await AsyncStorage.setItem(EMBEDDINGS_INITIALIZED_KEY, "true");
        console.log("[Embeddings] Successfully initialized embeddings");
      } else {
        console.log("[Embeddings] Already initialized, skipping");
      }
    } catch (error) {
      console.error("[Embeddings] Failed to initialize embeddings:", error);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const loadedNotes = await getAllNotes();
      if (loadedNotes.length === 0) {
        const initialized = await initializeNotes();
        setNotes(initialized);
      } else {
        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      Alert.alert("Error", "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const performSemanticSearch = useCallback(async (query: string) => {
    try {
      setIsSearchingSemantic(true);
      console.log("[Semantic Search] Starting search for:", query);

      const response = await api.embeddings.search(query);
      console.log("[Semantic Search] API response:", response);

      const results = response.results || [];
      console.log("[Semantic Search] Results count:", results.length);

      const uniqueNoteIds = Array.from(
        new Set(results.map((r: SemanticSearchResult) => r.note_id))
      );

      // Filter local notes to find matches
      // Note: This assumes all notes are already loaded in 'notes' state.
      const matchedNotes = notes.filter((note) =>
        uniqueNoteIds.includes(note.id)
      );

      // Sort matched notes by similarity
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

      setSemanticMatchedNotes(sortedMatchedNotes);
    } catch (error) {
      console.error("Semantic search failed:", error);
      Alert.alert("Error", "Failed to perform semantic search");
    } finally {
      setIsSearchingSemantic(false);
    }
  }, [notes]);

  const processImage = useCallback(async (useCamera: boolean) => {
    try {
      setIsLoading(true);

      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission needed",
            "Camera permission is required to take photos."
          );
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: false,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permission needed",
            "Library permission is required to select photos."
          );
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
        const formData = new FormData();
        const uri = asset.uri;
        const filename = uri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("file", {
          uri: uri,
          name: filename,
          type: type,
        } as any);

        console.log("Sending image to OCR service...");
        const response = await fetch(`${API_URL}/ocr/extract`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`OCR failed with status: ${response.status}`);
        }

        const data = await response.json();
        const markdown = data.markdown;

        if (markdown) {
          router.push({
            pathname: "/(app)/note/new",
            params: { initialContent: markdown },
          } as any);
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      Alert.alert("Scan Failed", "Could not extract text from image.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // --- Effects ---

  // Load notes on mount
  useEffect(() => {
    if (session) {
      loadNotes();
      initializeEmbeddings();
    }
  }, [session, initializeEmbeddings, loadNotes]);

  // Reload notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session) {
        loadNotes();
      }
    }, [session, loadNotes])
  );

  // --- Event Handlers ---

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length === 0) {
      setSubmittedQuery("");
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
      setSemanticMatchedNotes([]);
    }
  }, [searchQuery, isSemanticSearch, performSemanticSearch]);

  const handleToggleSemantic = useCallback((value: boolean) => {
    setIsSemanticSearch(value);
    setSemanticResults([]);
    setSubmittedQuery("");
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const handleNotePress = useCallback(
    (noteId: string) => {
      router.push(`/(app)/note/${noteId}` as any);
    },
    [router]
  );

  const handleCreateNote = () => {
    router.push("/(app)/note/new" as any);
  };

  const handleScanPress = useCallback(() => {
    Alert.alert("Scan Note", "Choose an option to import a note", [
      {
        text: "Take Photo",
        onPress: () => processImage(true),
      },
      {
        text: "Choose from Library",
        onPress: () => processImage(false),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }, [processImage]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadNotes();
    } catch (error) {
      console.error("Failed to refresh notes:", error);
      Alert.alert(
        "Refresh Failed",
        "Unable to refresh notes. Please check your connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNotes]);

  // --- Render Helpers ---

  // Filtered and sorted notes
  const displayedNotes = useMemo(() => {
    const filtered = filterNotesBySearch(notes, submittedQuery);
    return sortNotes(filtered, sortBy);
  }, [notes, submittedQuery, sortBy]);

  const renderSkeletonCards = () => {
    const skeletonCount = numColumns * 3;
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

  const renderEmptyState = () => {
    if (isLoading) {
      return renderSkeletonCards();
    }

    if (searchQuery && displayedNotes.length === 0) {
      return (
        <View
          className="flex-1 items-center justify-center py-20"
          accessibilityLabel={`No notes found for ${searchQuery}`}
        >
          <Text className="text-base-content/50 text-lg mb-2 font-medium">
            No notes found
          </Text>
          <Text className="text-base-content/40 text-sm">
            No results for &quot;{searchQuery}&quot;
          </Text>
        </View>
      );
    }

    if (notes.length === 0) {
      return (
        <View
          className="flex-1 items-center justify-center py-20"
          accessibilityLabel="No notes yet. Create your first note to get started"
        >
          <Text className="text-base-content/50 text-lg mb-2 font-medium">
            No notes yet
          </Text>
          <Text className="text-base-content/40 text-sm">
            Create your first note to get started
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderNoteCard = useCallback(
    ({ item }: { item: Note }) => {
      const cardWidth = 100 / numColumns;
      return (
        <View className="px-3 mb-4" style={{ width: `${cardWidth}%` }}>
          <NoteCard note={item} onPress={handleNotePress} />
        </View>
      );
    },
    [handleNotePress, numColumns]
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => {
      const ITEM_HEIGHT = 176;
      const rowIndex = Math.floor(index / numColumns);
      return {
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * rowIndex,
        index,
      };
    },
    [numColumns]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-base-100"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View className="flex-1 pt-4">
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <NotesHeader onNewNote={handleCreateNote} onScan={handleScanPress} />

          <View className="mb-4 flex-row items-center space-x-2">
            <View className="flex-1">
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearchChange}
                onSearch={handleSearchSubmit}
                placeholder={
                  isSemanticSearch ? "Search by meaning..." : "Search notes..."
                }
                isSemantic={isSemanticSearch}
                onToggleSemantic={handleToggleSemantic}
              />
            </View>
            <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
          </View>
        </View>

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
            paddingHorizontal: horizontalPadding,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
              accessibilityLabel="Pull to refresh notes"
            />
          }
          getItemLayout={getItemLayout}
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          accessibilityLabel={`Notes list. ${displayedNotes.length} ${
            displayedNotes.length === 1 ? "note" : "notes"
          } displayed`}
          accessibilityRole="list"
        />
      </View>
    </SafeAreaView>
  );
}
