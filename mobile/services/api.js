/**
 * Mobile Centralized API Client
 *
 * Configured to connect to the backend REST API.
 * Uses EXPO_PUBLIC_API_URL or defaults to Android emulator loopback / localhost.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

export const fetchApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('API Health check fetch error:', error.message);
    throw error;
  }
};

export default {
  API_BASE_URL,
  fetchApiHealth,
};
