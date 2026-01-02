import { renderHook, act, waitFor } from '@testing-library/react-native';
import useAIService from '../useAIService';

// Mock global fetch
global.fetch = jest.fn();

describe('useAIService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with specific state', () => {
        const { result } = renderHook(() => useAIService());
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle successful API call', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ result: 'AI Output' }),
        });

        const { result } = renderHook(() => useAIService());

        let data;
        await act(async () => {
            data = await result.current.processPrompt({
                noteTitle: 'T',
                noteContent: 'C',
                userPrompt: 'P',
            });
        });

        expect(data).toEqual({ result: 'AI Output' });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle API failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Internal Error',
        });

        const { result } = renderHook(() => useAIService());

        await act(async () => {
            await result.current.processPrompt({
                noteTitle: 'T',
                noteContent: 'C',
                userPrompt: 'P',
            });
        });

        expect(result.current.error).toContain('Server Error: 500');
        expect(result.current.loading).toBe(false);
    });

    it('should set loading state correctly', async () => {
        // Delay response to check loading
        (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => {
            setTimeout(() => resolve({
                ok: true,
                json: async () => ({}),
            }), 100);
        }));

        const { result } = renderHook(() => useAIService());

        let promise: Promise<any>;
        act(() => {
            promise = result.current.processPrompt({ noteTitle: '', noteContent: '', userPrompt: '' });
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await promise;
        });

        expect(result.current.loading).toBe(false);
    });
});
