import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useChildren } from '../../hooks/useChildren';
import { getChildAssignments } from '../../services/parentApi';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyView } from '../../components/common/EmptyView';
import { ChildSelector } from '../../components/common/ChildSelector';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AssignmentsScreen = () => {
  const { selectedChildId, selectedChild } = useChildren();

  const [assignmentsData, setAssignmentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Subject filter: 'all' or specific subject string
  const [selectedSubject, setSelectedSubject] = useState('all');

  const loadAssignments = useCallback(async () => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const params = {};
      if (selectedSubject !== 'all') {
        params.subject = selectedSubject;
      }
      const data = await getChildAssignments(selectedChildId, params);
      setAssignmentsData(data);
    } catch (err) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChildId, selectedSubject]);

  useEffect(() => {
    setLoading(true);
    setAssignmentsData(null); // Clear stale child data immediately
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  if (!selectedChildId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildTitle}>No Student Selected</Text>
        <Text style={styles.noChildText}>Please select a child to view homework assignments.</Text>
      </View>
    );
  }

  const rawAssignments = assignmentsData?.assignments || [];

  // Extract distinct subjects for filter bar
  const distinctSubjects = Array.from(
    new Set(rawAssignments.map((a) => a.subject).filter(Boolean))
  );

  return (
    <View style={styles.container}>
      <ChildSelector />

      {/* Subject Filter Bar */}
      {distinctSubjects.length > 1 && (
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterPill, selectedSubject === 'all' && styles.filterPillActive]}
            onPress={() => setSelectedSubject('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterText, selectedSubject === 'all' && styles.filterTextActive]}
            >
              All Subjects
            </Text>
          </TouchableOpacity>

          {distinctSubjects.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[styles.filterPill, selectedSubject === sub && styles.filterPillActive]}
              onPress={() => setSelectedSubject(sub)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterText, selectedSubject === sub && styles.filterTextActive]}
              >
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && !refreshing ? (
        <LoadingView message="Loading homework assignments..." />
      ) : error && !assignmentsData ? (
        <ErrorView message={error} onRetry={loadAssignments} />
      ) : (
        <FlatList
          data={rawAssignments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
          ListHeaderComponent={
            <View style={styles.headerBanner}>
              <View style={styles.bannerRow}>
                <Text style={styles.headerTitle}>
                  Published Homework for {selectedChild?.className || 'Class'}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{rawAssignments.length} Tasks</Text>
                </View>
              </View>
              <Text style={styles.headerNote}>
                Teacher-assigned curriculum tasks. Draft materials are strictly excluded.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyView
              title="No Homework Found"
              message={`No published homework assignments are currently pending for ${selectedChild?.firstName || 'this student'}.`}
            />
          }
          renderItem={({ item }) => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const threeDaysLater = new Date();
            threeDaysLater.setDate(threeDaysLater.getDate() + 3);
            const threeDaysStr = threeDaysLater.toISOString().slice(0, 10);

            let urgency = 'upcoming';
            if (item.isOverdue || (item.dueDateString && item.dueDateString < todayStr)) {
              urgency = 'overdue';
            } else if (item.dueDateString === todayStr) {
              urgency = 'due_today';
            } else if (item.dueDateString && item.dueDateString <= threeDaysStr) {
              urgency = 'due_soon';
            }

            return (
              <View style={[styles.card, urgency === 'overdue' && styles.cardOverdue]}>
                <View style={styles.cardHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                  </View>
                  <StatusBadge status={urgency} />
                </View>

                <Text style={styles.assignmentTitle}>{item.title}</Text>

                {item.description ? (
                  <Text style={styles.assignmentDescription}>{item.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaBlock}>
                    <Text style={styles.metaLabel}>Assigned</Text>
                    <Text style={styles.metaValue}>{item.assignedDateString || 'Earlier'}</Text>
                  </View>

                  <View style={styles.metaBlock}>
                    <Text style={styles.metaLabel}>Deadline</Text>
                    <Text
                      style={[
                        styles.metaValue,
                        urgency === 'overdue' && styles.metaValueOverdue,
                        urgency === 'due_today' && styles.metaValueToday,
                      ]}
                    >
                      {item.dueDateString || 'No deadline'}
                    </Text>
                  </View>

                  <View style={styles.metaBlock}>
                    <Text style={styles.metaLabel}>Max Marks</Text>
                    <Text style={styles.metaValue}>{item.maxMarks} pts</Text>
                  </View>

                  {item.attachments && item.attachments.length > 0 ? (
                    <View style={styles.metaBlock}>
                      <Text style={styles.metaLabel}>Files</Text>
                      <Text style={styles.metaValue}>📎 {item.attachments.length}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  noChildTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  noChildText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterPillActive: {
    backgroundColor: '#4f46e5',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBanner: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312e81',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  headerNote: {
    fontSize: 11,
    color: '#4f46e5',
    marginTop: 4,
    lineHeight: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardOverdue: {
    borderColor: '#fecdd3',
    borderLeftWidth: 4,
    borderLeftColor: '#e11d48',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
    textTransform: 'uppercase',
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  assignmentDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaBlock: {
    marginRight: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  metaValueOverdue: {
    color: '#e11d48',
  },
  metaValueToday: {
    color: '#b45309',
  },
});

export default AssignmentsScreen;
