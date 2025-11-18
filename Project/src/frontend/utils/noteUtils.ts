import { Note, SortOption } from '../types/note';

/**
 * Filters notes based on search query matching against title
 * @param notes - Array of notes to filter
 * @param query - Search query string
 * @returns Filtered array of notes matching the query
 */
export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  // Handle empty search queries - return all notes
  if (!query || query.trim() === '') {
    return notes;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Case-insensitive title matching
  return notes.filter(note => 
    note.title.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Sorts notes based on the specified sort option
 * @param notes - Array of notes to sort
 * @param sortBy - Sort option to apply
 * @returns Sorted array of notes
 */
export function sortNotes(notes: Note[], sortBy: SortOption): Note[] {
  const notesCopy = [...notes];

  switch (sortBy) {
    case 'date-desc':
      // Latest first - descending order
      return notesCopy.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      });

    case 'date-asc':
      // Earliest first - ascending order
      return notesCopy.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateA - dateB;
      });

    case 'name-asc':
      // A-Z alphabetical
      return notesCopy.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });

    case 'name-desc':
      // Z-A reverse alphabetical
      return notesCopy.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleB.localeCompare(titleA);
      });

    default:
      return notesCopy;
  }
}

/**
 * Formats an ISO date string to relative time format
 * @param dateString - ISO 8601 date string
 * @returns Formatted relative time string (e.g., "2 days ago", "just now")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'unknown date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  } catch (error) {
    // Handle invalid date formats
    return 'unknown date';
  }
}
