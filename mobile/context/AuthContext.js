import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  saveToken,
  getToken,
  saveParentUserData,
  getParentUserData,
  clearAuthStorage,
} from '../services/secureStorage';
import {
  loginParent,
  getParentMe,
  registerUnauthorizedHandler,
} from '../services/parentApi';

export const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  parentUser: null,
  token: null,
  authError: null,
  sessionExpiredMessage: null,
  login: async () => {},
  logout: async () => {},
  clearAuthError: () => {},
  clearSessionExpiredMessage: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [parentUser, setParentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  /**
   * Handle expired session callback from API client (e.g. on 401)
   */
  const handleSessionExpired = useCallback(async (message) => {
    await clearAuthStorage();
    setToken(null);
    setParentUser(null);
    setIsAuthenticated(false);
    setSessionExpiredMessage(
      message || 'Your session has expired or was invalidated. Please sign in again.'
    );
  }, []);

  // Register the 401 interceptor callback
  useEffect(() => {
    registerUnauthorizedHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  /**
   * Restore existing session on initial app startup
   */
  const restoreSession = useCallback(async () => {
    setIsRestoringSession(true);
    try {
      const storedToken = await getToken();
      if (!storedToken) {
        setIsAuthenticated(false);
        setParentUser(null);
        setToken(null);
        return;
      }

      // Optimistically load cached user data for immediate UI rendering
      const cachedUserData = await getParentUserData();
      if (cachedUserData) {
        setParentUser(cachedUserData);
      }

      // Validate token with live backend
      try {
        const liveProfile = await getParentMe(storedToken);
        setParentUser(liveProfile);
        setToken(storedToken);
        setIsAuthenticated(true);
        await saveParentUserData(liveProfile);
      } catch (err) {
        // Token invalid or expired
        await clearAuthStorage();
        setIsAuthenticated(false);
        setParentUser(null);
        setToken(null);
        setSessionExpiredMessage('Your previous session has expired. Please sign in again.');
      }
    } catch (err) {
      setIsAuthenticated(false);
      setParentUser(null);
      setToken(null);
    } finally {
      setIsRestoringSession(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Parent Login
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    setSessionExpiredMessage(null);

    try {
      const response = await loginParent(email, password);
      const authToken = response.token;
      const user = response.user || response.parent;

      if (!authToken) {
        throw new Error('Authentication succeeded but server returned no token.');
      }

      // Persist in SecureStore
      await saveToken(authToken);
      await saveParentUserData(user);

      // Update state
      setToken(authToken);
      setParentUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Parent Logout
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await clearAuthStorage();
    } finally {
      setToken(null);
      setParentUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setSessionExpiredMessage(null);
      setIsLoading(false);
    }
  };

  /**
   * Refresh current parent profile from backend
   */
  const refreshProfile = async () => {
    try {
      const liveProfile = await getParentMe();
      setParentUser(liveProfile);
      await saveParentUserData(liveProfile);
      return liveProfile;
    } catch (err) {
      return null;
    }
  };

  const clearAuthError = () => setAuthError(null);
  const clearSessionExpiredMessage = () => setSessionExpiredMessage(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isRestoringSession,
        parentUser,
        token,
        authError,
        sessionExpiredMessage,
        login,
        logout,
        clearAuthError,
        clearSessionExpiredMessage,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
