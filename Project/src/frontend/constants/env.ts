
// Default to localhost for iOS/Web, 10.0.2.2 for Android Emulator
const LOCAL_API_URL = 'https://localhost:8000';
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL;
// Parse boolean from string 'true'/'false' or undefined
const __DEV__ = process.env.EXPO_PUBLIC__DEV__ === 'true';

// Debug logs to verify environment loading (can be removed in strict production if needed)
console.log("[Config] PROD_API_URL:", PROD_API_URL);
console.log("[Config] DEV_API_URL:", DEV_API_URL);
console.log("[Config] __DEV__:", __DEV__);

export const API_URL = __DEV__ ? (DEV_API_URL || LOCAL_API_URL) : (PROD_API_URL || LOCAL_API_URL);

console.log("[Config] Using API URL:", API_URL);

/**
 * Returns the configured API URL.
 * Useful if you need to fetch it dynamically or if logic becomes more complex.
 */
export const getApiUrl = () => API_URL;
