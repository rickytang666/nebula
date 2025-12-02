import { supabase } from "@/lib/supabase";

// Default to localhost for iOS/Web, 10.0.2.2 for Android Emulator
const LOCAL_API_URL = 'https://tracheoscopic-tran-telodynamic.ngrok-free.dev';
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL;
const __DEV__ = process.env.__DEV__;

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

  if (!token) {
    console.log('[API] No token found, aborting request');
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_URL}${endpoint}`;
  console.log(`[API] API URL: ${API_URL}`);
  console.log(`[API] Fetching: ${url}`);
  console.log(`[API] Token present: ${!!token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`[API] Response Status: ${response.status}`);

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  console.log(`[API] Response Body Preview: ${text.substring(0, 200)}`);

  if (!response.ok) {
    let errorDetail = `API Error: ${response.statusText}`;
    try {
      const errorData = JSON.parse(text);
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      // If parsing fails, use the raw text if it's short, otherwise status text
      if (text.length < 100) errorDetail = text;
    }
    throw new Error(errorDetail);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("[API] JSON Parse Error:", e);
    throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}...`);
  }
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

  embeddings: {
    search: (query: string, limit = 10) =>
      fetchWithAuth('/embeddings/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
      }),

    embedAll: () =>
      fetchWithAuth('/embeddings/embed-all', {
        method: 'POST',
      }),
  },
};
