import { Note } from '../types/note';
import { api } from '../services/api';

/**
 * Initialize notes storage
 * No longer needed for API, but kept for compatibility if needed.
 */
export async function initializeNotes(): Promise<Note[]> {
  return getAllNotes();
}

/**
 * Get all notes from API
 */
export async function getAllNotes(): Promise<Note[]> {
  try {
    const notes = await api.notes.list();
    return notes;
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
}

/**
 * Get a single note by ID
 */
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const note = await api.notes.get(id);
    return note;
  } catch (error) {
    console.error('Error getting note:', error);
    return null;
  }
}

/**
 * Save or update a note
 */
export async function saveNote(note: Note): Promise<Note> {
  try {
    // Check if note exists (by ID format or by trying to get it)
    // For simplicity, if it has a numeric/UUID-like ID it might be existing.
    // However, the frontend generates a timestamp ID for new notes: Date.now().toString()
    // The backend uses UUIDs.
    // So if the ID is a timestamp (numeric), it's a new note for the backend.
    // If it's a UUID, it's an existing note.

    const isNewNote = !note.id || !note.id.includes('-'); // UUIDs have dashes, Date.now() doesn't

    if (isNewNote) {
      const newNote = await api.notes.create({
        title: note.title,
        content: note.content,
        basic_stats: (note as any).basic_stats
      });
      return newNote;
    } else {
      const updatedNote = await api.notes.update(note.id, {
        title: note.title,
        content: note.content,
        basic_stats: (note as any).basic_stats
      });
      return updatedNote;
    }
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

/**
 * Delete a note by ID
 */
export async function deleteNote(id: string): Promise<void> {
  try {
    // If ID is not a UUID (e.g. timestamp for new unsaved note), don't call API
    if (id && !id.includes('-')) {
      console.log('Deleting local-only note (not synced to backend):', id);
      return;
    }

    await api.notes.delete(id);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Clear all notes
 * Not implemented for API to avoid accidental data loss
 */
export async function clearAllNotes(): Promise<void> {
  console.warn('clearAllNotes not implemented for API storage');
}
