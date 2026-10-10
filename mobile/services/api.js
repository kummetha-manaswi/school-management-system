/**
 * Mobile Centralized API Client
 *
 * Configured to connect to the backend REST API.
 * Uses dynamic apiConfig base URL resolution.
 */

import { getApiBaseUrl } from '../config/apiConfig';
import parentApi from './parentApi';

export const fetchApiHealth = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('API Health check fetch error:', error.message);
    throw error;
  }
};

export { parentApi };

export default {
  getApiBaseUrl,
  fetchApiHealth,
  ...parentApi,
};
