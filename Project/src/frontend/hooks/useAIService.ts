import { useState, useCallback } from 'react';

// Logic to find the correct server address
// If you are using an Android Emulator, 'localhost' refers to the emulator itself.
// We use 10.0.2.2 to refer to your computer's localhost.
const LOCAL_API_URL = 'http://localhost:8000';
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL;
const __DEV__ = process.env.EXPO_PUBLIC__DEV__;

// This selects the right URL based on your environment
const API_URL = __DEV__ ? (DEV_API_URL || LOCAL_API_URL) : (PROD_API_URL || LOCAL_API_URL);
//const API_URL = DEV_API_URL;
console.log("Using API URL:", API_URL);
console.log("__DEV__:", __DEV__);

export interface AIProcessRequest {
  noteTitle: string;
  noteContent: string;
  userPrompt: string;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPrompt = useCallback(async (request: AIProcessRequest) => {
    setLoading(true);
    setError(null);

    try {
      // Send data to YOUR backend at /ai/process
      const response = await fetch(`${API_URL}/ai/process`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error: ${response.status} - ${text}`);
      }
      
      const data = await response.json();
      console.log("AI Service Response:", data);
      return data; // This contains the 'result' from Gemini
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error("AI Service Error:", message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, processPrompt };
};

export default useAIService;