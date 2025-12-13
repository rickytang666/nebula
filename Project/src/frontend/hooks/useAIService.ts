import { useState, useCallback } from 'react';

import { API_URL } from '@/constants/env';

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