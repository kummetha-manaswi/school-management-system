import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hooks/useAuth';
import { getApiBaseUrl, setRuntimeApiUrl } from '../../config/apiConfig';
import { testApiHealth } from '../../services/parentApi';
import { saveApiUrlOverride } from '../../services/secureStorage';

export const SignInScreen = () => {
  const { login, isLoading, authError, sessionExpiredMessage, clearAuthError, clearSessionExpiredMessage } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getApiBaseUrl());
  const [pingStatus, setPingStatus] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      return;
    }
    clearAuthError();
    clearSessionExpiredMessage();
    await login(email, password);
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      if (customApiUrl) {
        setRuntimeApiUrl(customApiUrl);
        await saveApiUrlOverride(customApiUrl);
      }
      const res = await testApiHealth();
      setPingStatus({ success: true, message: `Connected! Status: ${res.status || 'OK'}` });
    } catch (err) {
      setPingStatus({ success: false, message: err.message || 'Cannot reach server' });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SM</Text>
          </View>
          <Text style={styles.title}>Parent Portal</Text>
          <Text style={styles.subtitle}>Sign in to view your children's academic records</Text>
        </View>

        {/* Session Expired Banner */}
        {sessionExpiredMessage && (
          <View style={styles.sessionBanner}>
            <Text style={styles.sessionBannerText}>{sessionExpiredMessage}</Text>
          </View>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., parent@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (authError) clearAuthError();
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (authError) clearAuthError();
              }}
            />
          </View>

          <TouchableOpacity
            style={[styles.signInButton, (!email || !password || isLoading) && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={!email || !password || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In to Parent Portal</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Server & Network Diagnostics (Expandable) */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            style={styles.settingsToggle}
          >
            <Text style={styles.settingsToggleText}>
              {showSettings ? '▲ Hide API Server Settings' : '▼ Server & Network Settings'}
            </Text>
          </TouchableOpacity>

          {showSettings && (
            <View style={styles.settingsCard}>
              <Text style={styles.settingsLabel}>Backend API Base URL:</Text>
              <TextInput
                style={styles.settingsInput}
                value={customApiUrl}
                onChangeText={setCustomApiUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.settingsNote}>
                Note: In Android Emulator use 10.0.2.2. On physical devices, use your PC's LAN IP (e.g. http://192.168.1.50:5000/api).
              </Text>

              <TouchableOpacity
                style={styles.pingButton}
                onPress={handleTestPing}
                disabled={isPinging}
              >
                {isPinging ? (
                  <ActivityIndicator color="#4f46e5" size="small" />
                ) : (
                  <Text style={styles.pingButtonText}>Test Connection to Backend</Text>
                )}
              </TouchableOpacity>

              {pingStatus && (
                <View
                  style={[
                    styles.pingResult,
                    pingStatus.success ? styles.pingSuccess : styles.pingError,
                  ]}
                >
                  <Text
                    style={
                      pingStatus.success ? styles.pingSuccessText : styles.pingErrorText
                    }
                  >
                    {pingStatus.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  sessionBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  sessionBannerText: {
    color: '#b45309',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  signInButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  signInButtonDisabled: {
    backgroundColor: '#a5b4fc',
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  settingsSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  settingsToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  settingsToggleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  settingsInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 6,
  },
  settingsNote: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
    marginBottom: 12,
  },
  pingButton: {
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pingButtonText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '700',
  },
  pingResult: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
  },
  pingSuccess: {
    backgroundColor: '#ecfdf5',
  },
  pingError: {
    backgroundColor: '#fff1f2',
  },
  pingSuccessText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  pingErrorText: {
    color: '#9f1239',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SignInScreen;
