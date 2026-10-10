import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Mobile Secure Storage Service
 * 
 * Securely persists parent authentication tokens and session claims using
 * Expo SecureStore (backed by Keychain on iOS and Keystore on Android).
 * 
 * SECURITY POLICY:
 * - Never log tokens or sensitive authentication claims.
 * - Do NOT use AsyncStorage or localStorage for tokens.
 * - Graceful in-memory fallback for environments where SecureStore native bindings are unavailable (e.g. Node test suites or web preview).
 */

const KEYS = {
  PARENT_AUTH_TOKEN: 'sm_parent_jwt_token',
  PARENT_USER_DATA: 'sm_parent_user_data',
  API_URL_OVERRIDE: 'sm_api_url_override',
};

// In-memory fallback for tests or web
const memoryStore = new Map();

/**
 * Check whether Expo SecureStore native module is available
 */
const isSecureStoreAvailable = async () => {
  try {
    if (Platform.OS === 'web') return false;
    if (typeof SecureStore.isAvailableAsync === 'function') {
      return await SecureStore.isAvailableAsync();
    }
    return Boolean(SecureStore.setItemAsync);
  } catch {
    return false;
  }
};

/**
 * Save JWT token securely
 */
export const saveToken = async (token) => {
  if (!token) return;
  const available = await isSecureStoreAvailable();
  if (available) {
    await SecureStore.setItemAsync(KEYS.PARENT_AUTH_TOKEN, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } else {
    memoryStore.set(KEYS.PARENT_AUTH_TOKEN, token);
  }
};

/**
 * Retrieve stored JWT token
 */
export const getToken = async () => {
  const available = await isSecureStoreAvailable();
  if (available) {
    return await SecureStore.getItemAsync(KEYS.PARENT_AUTH_TOKEN);
  }
  return memoryStore.get(KEYS.PARENT_AUTH_TOKEN) || null;
};

/**
 * Delete stored JWT token
 */
export const deleteToken = async () => {
  const available = await isSecureStoreAvailable();
  if (available) {
    await SecureStore.deleteItemAsync(KEYS.PARENT_AUTH_TOKEN);
  }
  memoryStore.delete(KEYS.PARENT_AUTH_TOKEN);
};

/**
 * Save cached parent user info
 */
export const saveParentUserData = async (userData) => {
  if (!userData) return;
  const jsonStr = JSON.stringify(userData);
  const available = await isSecureStoreAvailable();
  if (available) {
    await SecureStore.setItemAsync(KEYS.PARENT_USER_DATA, jsonStr);
  } else {
    memoryStore.set(KEYS.PARENT_USER_DATA, jsonStr);
  }
};

/**
 * Get cached parent user info
 */
export const getParentUserData = async () => {
  try {
    const available = await isSecureStoreAvailable();
    let jsonStr = null;
    if (available) {
      jsonStr = await SecureStore.getItemAsync(KEYS.PARENT_USER_DATA);
    } else {
      jsonStr = memoryStore.get(KEYS.PARENT_USER_DATA) || null;
    }
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch {
    return null;
  }
};

/**
 * Delete cached parent user info
 */
export const deleteParentUserData = async () => {
  const available = await isSecureStoreAvailable();
  if (available) {
    await SecureStore.deleteItemAsync(KEYS.PARENT_USER_DATA);
  }
  memoryStore.delete(KEYS.PARENT_USER_DATA);
};

/**
 * Clear all stored authentication data (Logout / Session Invalidation)
 */
export const clearAuthStorage = async () => {
  await deleteToken();
  await deleteParentUserData();
};

/**
 * Save custom API URL override
 */
export const saveApiUrlOverride = async (url) => {
  const available = await isSecureStoreAvailable();
  if (available) {
    if (url) {
      await SecureStore.setItemAsync(KEYS.API_URL_OVERRIDE, url);
    } else {
      await SecureStore.deleteItemAsync(KEYS.API_URL_OVERRIDE);
    }
  } else {
    if (url) memoryStore.set(KEYS.API_URL_OVERRIDE, url);
    else memoryStore.delete(KEYS.API_URL_OVERRIDE);
  }
};

/**
 * Get custom API URL override
 */
export const getApiUrlOverride = async () => {
  const available = await isSecureStoreAvailable();
  if (available) {
    return await SecureStore.getItemAsync(KEYS.API_URL_OVERRIDE);
  }
  return memoryStore.get(KEYS.API_URL_OVERRIDE) || null;
};

export default {
  saveToken,
  getToken,
  deleteToken,
  saveParentUserData,
  getParentUserData,
  deleteParentUserData,
  clearAuthStorage,
  saveApiUrlOverride,
  getApiUrlOverride,
};
