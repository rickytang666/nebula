/**
 * Note data model interface
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  tags: string[];
  user_id?: string; // For future multi-user support
}

/**
 * Sort options for notes list
 */
export type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

/**
 * State interface for Notes List Screen
 */
export interface NotesListState {
  searchQuery: string;
  sortBy: SortOption;
  notes: Note[];
  isLoading: boolean;
}

/**
 * State interface for Note Detail Screen
 */
export interface NoteDetailState {
  note: Note;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}
