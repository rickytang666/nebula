import { supabase } from "@/lib/supabase";

// Default to localhost for iOS/Web, 10.0.2.2 for Android Emulator
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.statusText}`);
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
};
