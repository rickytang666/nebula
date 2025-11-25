import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';
import { SAMPLE_NOTES } from '../data/sampleNotes';

const NOTES_STORAGE_KEY = 'notes_storage';

/**
 * Initialize notes storage with sample data if empty
 */
export async function initializeNotes(): Promise<Note[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // First time - save sample notes
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(SAMPLE_NOTES));
      return SAMPLE_NOTES;
    }
  } catch (error) {
    console.error('Error initializing notes:', error);
    return SAMPLE_NOTES;
  }
}

/**
 * Get all notes from storage
 */
export async function getAllNotes(): Promise<Note[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
    const notes = await getAllNotes();
    return notes.find(note => note.id === id) || null;
  } catch (error) {
    console.error('Error getting note:', error);
    return null;
  }
}

/**
 * Save or update a note
 */
export async function saveNote(note: Note): Promise<void> {
  try {
    const notes = await getAllNotes();
    const index = notes.findIndex(n => n.id === note.id);
    
    if (index >= 0) {
      // Update existing note
      notes[index] = note;
    } else {
      // Add new note
      notes.unshift(note); // Add to beginning
    }
    
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
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
    const notes = await getAllNotes();
    const filtered = notes.filter(note => note.id !== id);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Clear all notes (for testing)
 */
export async function clearAllNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notes:', error);
    throw error;
  }
}
