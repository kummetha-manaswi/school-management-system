import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getApiBaseUrl, setRuntimeApiUrl, getPlatformInfo } from '../../config/apiConfig';
import { testApiHealth, getParentProfile } from '../../services/parentApi';
import { saveApiUrlOverride } from '../../services/secureStorage';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProfileScreen = () => {
  const { parentUser, logout } = useAuth();

  const [liveProfile, setLiveProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getApiBaseUrl());
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [showDevSettings, setShowDevSettings] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getParentProfile();
        setLiveProfile(data);
      } catch {
        // Fall back to cached parentUser from session
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      if (customApiUrl) {
        setRuntimeApiUrl(customApiUrl);
        await saveApiUrlOverride(customApiUrl);
      }
      const res = await testApiHealth();
      setPingResult({ success: true, message: `Connected! Status: ${res.status || 'OK'}` });
    } catch (err) {
      setPingResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsPinging(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of the Parent Portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const profile = liveProfile || parentUser || {};
  const platformInfo = getPlatformInfo();

  // Gate developer override to development builds or explicit expandable toggle
  const isDevMode = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'P'}
          </Text>
        </View>

        <Text style={styles.name}>
          {profile.firstName ? `${profile.firstName} ${profile.lastName}` : profile.name || 'Parent User'}
        </Text>
        <Text style={styles.email}>{profile.email}</Text>

        <View style={styles.badgeRow}>
          <StatusBadge status={profile.status || 'active'} />
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>PARENT ACCOUNT</Text>
          </View>
        </View>
      </View>

      {/* Account Details Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Parent Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>
            {profile.firstName ? `${profile.firstName} ${profile.lastName}` : profile.name || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Email</Text>
          <Text style={styles.infoValue}>{profile.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Phone</Text>
          <Text style={styles.infoValue}>{profile.phone || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Occupation</Text>
          <Text style={styles.infoValue}>{profile.occupation || 'Not Provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address / City</Text>
          <Text style={styles.infoValue}>
            {profile.city ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}` : 'Not Provided'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Status</Text>
          <Text style={styles.infoValue}>
            {profile.status ? profile.status.toUpperCase() : 'ACTIVE'}
          </Text>
        </View>
      </View>

      {/* Security & Data Safeguards */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Privacy & Security Safeguards</Text>
        <Text style={styles.securityDesc}>
          • Secure token stored using hardware-backed SecureStore encryption.{'\n'}
          • Role-isolated parent access only.{'\n'}
          • Academic records scoped strictly to administratively verified children.{'\n'}
          • Educational notes and administrative records are confidential.
        </Text>
      </View>

      {/* Developer Diagnostics (Gated to Development Mode) */}
      {(isDevMode || showDevSettings) && (
        <View style={styles.devCard}>
          <View style={styles.devHeader}>
            <Text style={styles.devTitle}>🛠️ Developer Network Diagnostics</Text>
          </View>
          <Text style={styles.devDesc}>
            Configure host IP for physical testing over local network:
          </Text>

          <Text style={styles.inputLabel}>Backend API Base URL:</Text>
          <TextInput
            style={styles.apiInput}
            value={customApiUrl}
            onChangeText={setCustomApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>Platform: {platformInfo.isEmulator}</Text>
          </View>

          <TouchableOpacity style={styles.pingButton} onPress={handleTestPing} disabled={isPinging}>
            {isPinging ? (
              <ActivityIndicator color="#4f46e5" size="small" />
            ) : (
              <Text style={styles.pingButtonText}>Test Connection to Backend</Text>
            )}
          </TouchableOpacity>

          {pingResult && (
            <View
              style={[
                styles.pingResult,
                pingResult.success ? styles.pingSuccess : styles.pingError,
              ]}
            >
              <Text
                style={
                  pingResult.success ? styles.pingSuccessText : styles.pingErrorText
                }
              >
                {pingResult.message}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Subtle toggle for dev settings when outside __DEV__ */}
      {!isDevMode && (
        <TouchableOpacity
          style={styles.devToggle}
          onPress={() => setShowDevSettings(!showDevSettings)}
        >
          <Text style={styles.devToggleText}>
            {showDevSettings ? 'Hide Network Settings' : 'Developer Network Settings'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Logout Action Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sign out of parent account"
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  email: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  securityDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  devCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  devHeader: {
    marginBottom: 6,
  },
  devTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  devDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  apiInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 6,
  },
  platformBadge: {
    marginBottom: 10,
  },
  platformText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  pingButton: {
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    paddingVertical: 9,
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
  devToggle: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  devToggleText: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
