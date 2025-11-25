import { filterNotesBySearch, sortNotes, formatRelativeTime } from '../noteUtils';
import { Note, SortOption } from '../../types/note';

// Sample test data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes',
    content: 'Important meeting',
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-11-01T10:00:00Z',
    tags: ['work']
  },
  {
    id: '2',
    title: 'Shopping List',
    content: 'Buy groceries',
    created_at: '2024-11-05T14:00:00Z',
    updated_at: '2024-11-05T14:00:00Z',
    tags: ['personal']
  },
  {
    id: '3',
    title: 'Project Ideas',
    content: 'New project concepts',
    created_at: '2024-11-03T09:00:00Z',
    updated_at: '2024-11-03T09:00:00Z',
    tags: ['work']
  }
];

describe('filterNotesBySearch', () => {
  test('returns all notes when query is empty', () => {
    const result = filterNotesBySearch(mockNotes, '');
    expect(result).toEqual(mockNotes);
  });

  test('returns all notes when query is whitespace', () => {
    const result = filterNotesBySearch(mockNotes, '   ');
    expect(result).toEqual(mockNotes);
  });

  test('filters notes by title case-insensitively', () => {
    const result = filterNotesBySearch(mockNotes, 'meeting');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meeting Notes');
  });

  test('filters notes with uppercase query', () => {
    const result = filterNotesBySearch(mockNotes, 'SHOPPING');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Shopping List');
  });

  test('filters notes with partial match', () => {
    const result = filterNotesBySearch(mockNotes, 'list');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Shopping List');
  });

  test('returns empty array when no matches found', () => {
    const result = filterNotesBySearch(mockNotes, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('sortNotes', () => {
  test('sorts notes by date descending (latest first)', () => {
    const result = sortNotes(mockNotes, 'date-desc');
    expect(result[0].id).toBe('2'); // Nov 5
    expect(result[1].id).toBe('3'); // Nov 3
    expect(result[2].id).toBe('1'); // Nov 1
  });

  test('sorts notes by date ascending (earliest first)', () => {
    const result = sortNotes(mockNotes, 'date-asc');
    expect(result[0].id).toBe('1'); // Nov 1
    expect(result[1].id).toBe('3'); // Nov 3
    expect(result[2].id).toBe('2'); // Nov 5
  });

  test('sorts notes alphabetically A-Z', () => {
    const result = sortNotes(mockNotes, 'name-asc');
    expect(result[0].title).toBe('Meeting Notes');
    expect(result[1].title).toBe('Project Ideas');
    expect(result[2].title).toBe('Shopping List');
  });

  test('sorts notes alphabetically Z-A', () => {
    const result = sortNotes(mockNotes, 'name-desc');
    expect(result[0].title).toBe('Shopping List');
    expect(result[1].title).toBe('Project Ideas');
    expect(result[2].title).toBe('Meeting Notes');
  });

  test('handles notes with empty titles', () => {
    const notesWithEmpty: Note[] = [
      { ...mockNotes[0], title: '' },
      mockNotes[1]
    ];
    const result = sortNotes(notesWithEmpty, 'name-asc');
    expect(result).toHaveLength(2);
  });

  test('does not mutate original array', () => {
    const original = [...mockNotes];
    sortNotes(mockNotes, 'date-desc');
    expect(mockNotes).toEqual(original);
  });
});

describe('formatRelativeTime', () => {
  test('formats recent time as "just now"', () => {
    const now = new Date();
    const result = formatRelativeTime(now.toISOString());
    expect(result).toBe('just now');
  });

  test('formats minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toBe('5 minutes ago');
  });

  test('formats hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toBe('3 hours ago');
  });

  test('formats days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toBe('2 days ago');
  });

  test('handles invalid date format', () => {
    const result = formatRelativeTime('invalid-date');
    expect(result).toBe('unknown date');
  });

  test('handles singular units correctly', () => {
    const date = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toBe('1 minute ago');
  });
});
