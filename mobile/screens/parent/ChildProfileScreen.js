import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useChildren } from '../../hooks/useChildren';
import { getChildProfile } from '../../services/parentApi';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ChildProfileScreen = ({ route, navigation }) => {
  const { selectedChildId, selectChild } = useChildren();
  const studentId = route?.params?.studentId || selectedChildId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getChildProfile(studentId);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Unable to load student profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    setLoading(true);
    setProfile(null); // Clear stale child data immediately upon switching child
    loadProfile();
  }, [loadProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSetAsActive = () => {
    if (studentId) {
      selectChild(studentId);
    }
  };

  if (!studentId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Student Selected</Text>
        <Text style={styles.emptySubtitle}>
          Please select a student from the My Children list.
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingView message="Loading verified student profile..." />;
  }

  if (error && !profile) {
    return <ErrorView message={error} onRetry={loadProfile} />;
  }

  const isSelectedActive = selectedChildId === studentId;

  const formattedDob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Recorded';

  const formattedVerifiedAt = profile?.verifiedAt
    ? new Date(profile.verifiedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Administratively Verified';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
    >
      {/* Profile Header Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>

        <Text style={styles.fullName}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.classSection}>
          Class {profile?.className} {profile?.section ? `• Section ${profile.section}` : ''}
        </Text>

        <View style={styles.badgeRow}>
          <StatusBadge status={profile?.status} />
          <View style={styles.relationshipPill}>
            <Text style={styles.relationshipPillText}>
              {profile?.relationshipType ? profile.relationshipType.toUpperCase() : 'GUARDIAN'}
            </Text>
          </View>
          {isSelectedActive ? (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>✓ CURRENT SELECTION</Text>
            </View>
          ) : null}
        </View>

        {!isSelectedActive && (
          <TouchableOpacity
            style={styles.setActiveButton}
            onPress={handleSetAsActive}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Set ${profile?.firstName} as active student`}
          >
            <Text style={styles.setActiveButtonText}>Set as Active Child Context</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Academic Identification Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Academic Identification</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Admission Number</Text>
          <Text style={styles.infoValue}>{profile?.admissionNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Roll Number</Text>
          <Text style={styles.infoValue}>{profile?.rollNumber || 'Not Assigned'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Enrolled Class</Text>
          <Text style={styles.infoValue}>{profile?.className}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Assigned Section</Text>
          <Text style={styles.infoValue}>{profile?.section || 'All Sections'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Student Status</Text>
          <Text style={styles.infoValue}>
            {profile?.status ? profile.status.toUpperCase() : 'ACTIVE'}
          </Text>
        </View>
      </View>

      {/* Personal & Medical Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal & Demographic</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>
            {profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          <Text style={styles.infoValue}>{formattedDob}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Blood Group</Text>
          <Text style={styles.infoValue}>{profile?.bloodGroup || 'Not Recorded'}</Text>
        </View>
      </View>

      {/* Relationship & Governance */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Relationship & Safeguards</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Relationship Type</Text>
          <Text style={styles.infoValue}>
            {profile?.relationshipType ? profile.relationshipType.toUpperCase() : 'GUARDIAN'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Admin Verification</Text>
          <Text style={styles.infoValue}>{formattedVerifiedAt}</Text>
        </View>
      </View>

      {/* Quick Navigation to Child Modules */}
      <View style={styles.actionSection}>
        <Text style={styles.actionSectionTitle}>Academic Modules for {profile?.firstName}</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!isSelectedActive) handleSetAsActive();
              navigation.navigate('Attendance');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📅</Text>
            <Text style={styles.actionButtonText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!isSelectedActive) handleSetAsActive();
              navigation.navigate('Homework');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📝</Text>
            <Text style={styles.actionButtonText}>Homework</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (!isSelectedActive) handleSetAsActive();
              navigation.navigate('Exams');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>Exams</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  classSection: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  relationshipPill: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relationshipPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  setActiveButton: {
    marginTop: 14,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  setActiveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
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
    marginBottom: 12,
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
  actionSection: {
    marginTop: 6,
  },
  actionSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});

export default ChildProfileScreen;
