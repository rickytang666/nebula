import { useState, useCallback } from 'react';

export interface AIProcessRequest {
  noteTitle: string;
  noteContent: string;
  userPrompt: string;
}

export interface AIProcessResponse {
  result: string;
  processedAt: string;
  modelUsed: string;
}

export interface UseAIServiceOptions {
  baseURL?: string;
  timeout?: number;
}

/**
 * Custom hook for AI service API interactions
 * Handles processing requests to the AI backend endpoint
 */
export const useAIService = (options: UseAIServiceOptions = {}) => {
  const { baseURL = '', timeout = 30000 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process a user prompt with AI using note context
   */
  const processPrompt = useCallback(
    async (request: AIProcessRequest): Promise<AIProcessResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        

        const response = await fetch(`${baseURL}/api/ai/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: AIProcessResponse = await response.json();
        return data;
      } catch (err) {
        let errorMessage = 'Failed to process AI request';

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Request timeout - AI processing took too long';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseURL, timeout]
  );

  /**
   * Summarize note content
   */
  const summarizeNote = useCallback(
    async (noteTitle: string, noteContent: string) => {
      return processPrompt({
        noteTitle,
        noteContent,
        userPrompt: 'Summarize this note in 3-5 key points',
      });
    },
    [processPrompt]
  );

  /**
   * Generate ideas from note content
   */
  const generateIdeas = useCallback(
    async (noteTitle: string, noteContent: string) => {
      return processPrompt({
        noteTitle,
        noteContent,
        userPrompt: 'Generate 3-5 actionable ideas based on this note',
      });
    },
    [processPrompt]
  );

  /**
   * Polish/improve note content
   */
  const polishContent = useCallback(
    async (noteTitle: string, noteContent: string) => {
      return processPrompt({
        noteTitle,
        noteContent,
        userPrompt: 'Improve the grammar, clarity, and flow of this note',
      });
    },
    [processPrompt]
  );

  /**
   * Extract action items from note
   */
  const extractActionItems = useCallback(
    async (noteTitle: string, noteContent: string) => {
      return processPrompt({
        noteTitle,
        noteContent,
        userPrompt: 'Extract all action items from this note as a checklist',
      });
    },
    [processPrompt]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    processPrompt,
    summarizeNote,
    generateIdeas,
    polishContent,
    extractActionItems,
    clearError,
  };
};

export default useAIService;
