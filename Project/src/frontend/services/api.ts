import { supabase } from "@/lib/supabase";

// Default to localhost for iOS/Web, 10.0.2.2 for Android Emulator
const LOCAL_API_URL = 'http://localhost:8000';
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL;

const API_URL = __DEV__ ? (DEV_API_URL || LOCAL_API_URL) : (PROD_API_URL || LOCAL_API_URL);

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Generic fetch wrapper that handles auth headers automatically
 */
async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_URL}${endpoint}`;
  console.log(`[API] Fetching: ${url}`);
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  profiles: {
    create: (data: { full_name: string }) =>
      fetchWithAuth('/profiles/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMe: () =>
      fetchWithAuth('/profiles/me'),

    update: (data: { full_name?: string }) =>
      fetchWithAuth('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  notes: {
    list: (skip = 0, limit = 100) =>
      fetchWithAuth(`/notes/?skip=${skip}&limit=${limit}`),

    get: (id: string) =>
      fetchWithAuth(`/notes/${id}`),

    create: (data: { title?: string; content: string; basic_stats?: any }) =>
      fetchWithAuth('/notes/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { title?: string; content?: string; basic_stats?: any }) =>
      fetchWithAuth(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchWithAuth(`/notes/${id}`, {
        method: 'DELETE',
      }),

    search: (query: string) =>
      fetchWithAuth(`/notes/search?q=${encodeURIComponent(query)}`),
  },
};
