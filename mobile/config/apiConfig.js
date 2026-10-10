import { Platform } from 'react-native';

/**
 * Mobile API Configuration
 * 
 * Configures the backend REST API base URL for different development environments:
 * 1. Physical Device: Uses EXPO_PUBLIC_API_URL from environment (e.g., http://192.168.1.X:5000/api)
 *    or a runtime configured IP.
 * 2. Android Emulator: Defaults to http://10.0.2.2:5000/api (maps to host localhost).
 * 3. iOS Simulator: Defaults to http://localhost:5000/api.
 * 4. Web / Fallback: Defaults to http://localhost:5000/api.
 */

// In-memory runtime override if parent modifies API URL in Profile / Settings
let runtimeApiUrlOverride = null;

export const setRuntimeApiUrl = (url) => {
  if (url && typeof url === 'string') {
    runtimeApiUrlOverride = url.trim().replace(/\/+$/, '');
  } else {
    runtimeApiUrlOverride = null;
  }
};

export const getRuntimeApiUrl = () => runtimeApiUrlOverride;

export const getDefaultApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const getApiBaseUrl = () => {
  return runtimeApiUrlOverride || getDefaultApiBaseUrl();
};

export const getPlatformInfo = () => {
  return {
    os: Platform.OS,
    version: Platform.Version,
    isEmulator: Platform.OS === 'android' ? 'Android Emulator (10.0.2.2)' : 'Simulator / Device',
  };
};

export default {
  getApiBaseUrl,
  getDefaultApiBaseUrl,
  setRuntimeApiUrl,
  getRuntimeApiUrl,
  getPlatformInfo,
};
