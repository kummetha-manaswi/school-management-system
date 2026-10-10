import { getApiBaseUrl } from '../config/apiConfig';
import { getToken } from './secureStorage';

/**
 * Mobile Parent API Client
 * 
 * Secure client interface communicating with backend Phase 3 Parent endpoints.
 * Handles authentication headers, session-expired intercepts, and clean error representations.
 */

let unauthorizedHandler = null;

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

/**
 * Helper to execute authorized HTTP requests with error parsing
 */
const request = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // If token is not explicitly passed in headers, retrieve stored token
  if (!headers.Authorization && !options.skipAuth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error(
      `Network connection failed. Unable to reach backend at ${baseUrl}. Please check your connection or API URL settings.`
    );
  }

  // Handle Session Invalidation / Expired Token
  if (response.status === 401) {
    if (unauthorizedHandler && !options.skipUnauthorizedCallback) {
      unauthorizedHandler('Your session has expired. Please sign in again.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || 'Session expired or authentication failed (401).');
  }

  // Handle other HTTP errors
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.data !== undefined ? responseData.data : responseData;
};

// =============================================================================
// AUTHENTICATION ENDPOINTS (/api/auth/parent/*)
// =============================================================================

/**
 * Parent login with email and password
 */
export const loginParent = async (email, password) => {
  return await request('/auth/parent/login', {
    method: 'POST',
    skipAuth: true,
    skipUnauthorizedCallback: true,
    body: JSON.stringify({ email: String(email).trim(), password }),
  });
};

/**
 * Fetch currently authenticated parent profile
 */
export const getParentMe = async (explicitToken) => {
  const headers = explicitToken ? { Authorization: `Bearer ${explicitToken}` } : {};
  return await request('/auth/parent/me', {
    method: 'GET',
    headers,
  });
};

// =============================================================================
// ACADEMIC & PROFILE ENDPOINTS (/api/academic/parent/*)
// =============================================================================

/**
 * Parent dashboard summary (active assignments, exams, attendance status)
 */
export const getDashboardSummary = async () => {
  return await request('/academic/parent/summary', {
    method: 'GET',
  });
};

/**
 * Get all verified linked children for authenticated parent
 */
export const getVerifiedChildren = async () => {
  return await request('/academic/parent/children', {
    method: 'GET',
  });
};

/**
 * Get authenticated parent's full profile
 */
export const getParentProfile = async () => {
  return await request('/academic/parent/profile', {
    method: 'GET',
  });
};

/**
 * Get whitelisted child profile
 */
export const getChildProfile = async (studentId) => {
  return await request(`/academic/parent/children/${studentId}`, {
    method: 'GET',
  });
};

/**
 * Get child attendance records and summary metrics
 */
export const getChildAttendance = async (studentId, params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.month) query.append('month', params.month);
  if (params.year) query.append('year', params.year);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return await request(`/academic/parent/children/${studentId}/attendance${qs}`, {
    method: 'GET',
  });
};

/**
 * Get child published assignments
 */
export const getChildAssignments = async (studentId, params = {}) => {
  const query = new URLSearchParams();
  if (params.subject) query.append('subject', params.subject);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return await request(`/academic/parent/children/${studentId}/assignments${qs}`, {
    method: 'GET',
  });
};

/**
 * Get child exams and results (respects publication privacy on server)
 */
export const getChildExamsAndResults = async (studentId, params = {}) => {
  const query = new URLSearchParams();
  if (params.examType) query.append('examType', params.examType);
  if (params.academicYear) query.append('academicYear', params.academicYear);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return await request(`/academic/parent/children/${studentId}/exams${qs}`, {
    method: 'GET',
  });
};

/**
 * Health check connectivity probe
 */
export const testApiHealth = async () => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Health check returned status ${response.status}`);
  }
  return await response.json();
};

export default {
  registerUnauthorizedHandler,
  loginParent,
  getParentMe,
  getDashboardSummary,
  getVerifiedChildren,
  getParentProfile,
  getChildProfile,
  getChildAttendance,
  getChildAssignments,
  getChildExamsAndResults,
  testApiHealth,
};
