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
import { getChildAttendance } from '../../services/parentApi';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyView } from '../../components/common/EmptyView';
import { ChildSelector } from '../../components/common/ChildSelector';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AttendanceScreen = () => {
  const { selectedChildId, selectedChild } = useChildren();

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter state: 'all' | 'current' | 'previous'
  const [filterMode, setFilterMode] = useState('all');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevYear = prevMonthDate.getFullYear();

  const loadAttendance = useCallback(async () => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);

      const params = {};
      if (filterMode === 'current') {
        params.month = currentMonth;
        params.year = currentYear;
      } else if (filterMode === 'previous') {
        params.month = prevMonth;
        params.year = prevYear;
      }

      const data = await getChildAttendance(selectedChildId, params);
      setAttendanceData(data);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChildId, filterMode, currentMonth, currentYear, prevMonth, prevYear]);

  // When selected child changes or filter changes, reload
  useEffect(() => {
    setLoading(true);
    setAttendanceData(null); // Clear previous child data to prevent stale display
    loadAttendance();
  }, [loadAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  if (!selectedChildId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildTitle}>No Student Selected</Text>
        <Text style={styles.noChildText}>Please select a child to view their attendance record.</Text>
      </View>
    );
  }

  const summary = attendanceData?.summary || {
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
  };
  const records = attendanceData?.records || [];

  return (
    <View style={styles.container}>
      <ChildSelector />

      {/* Filter Tabs Header */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'all' && styles.filterPillActive]}
          onPress={() => setFilterMode('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive]}>
            All Sessions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'current' && styles.filterPillActive]}
          onPress={() => setFilterMode('current')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'current' && styles.filterTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'previous' && styles.filterPillActive]}
          onPress={() => setFilterMode('previous')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'previous' && styles.filterTextActive]}>
            Last Month
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <LoadingView message="Loading attendance records..." />
      ) : error && !attendanceData ? (
        <ErrorView message={error} onRetry={loadAttendance} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id || item.dateString)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
          ListHeaderComponent={
            <View style={styles.summaryContainer}>
              {/* Rate Card */}
              <View style={styles.rateCard}>
                <View style={styles.rateLeft}>
                  <Text style={styles.rateLabel}>Attendance Percentage</Text>
                  <Text style={styles.rateValue}>{summary.attendanceRate}%</Text>
                  <Text style={styles.rateSub}>
                    {summary.totalDays} sessions evaluated in selected period
                  </Text>
                </View>
                <View style={styles.rateCircle}>
                  <Text style={styles.rateCircleText}>{summary.attendanceRate}%</Text>
                </View>
              </View>

              {/* Status Breakdown Grid */}
              <View style={styles.breakdownRow}>
                <View style={[styles.breakdownCard, { borderLeftColor: '#16a34a' }]}>
                  <Text style={styles.breakdownCount}>{summary.present}</Text>
                  <Text style={styles.breakdownLabel}>Present</Text>
                </View>
                <View style={[styles.breakdownCard, { borderLeftColor: '#dc2626' }]}>
                  <Text style={styles.breakdownCount}>{summary.absent}</Text>
                  <Text style={styles.breakdownLabel}>Absent</Text>
                </View>
                <View style={[styles.breakdownCard, { borderLeftColor: '#d97706' }]}>
                  <Text style={styles.breakdownCount}>{summary.late}</Text>
                  <Text style={styles.breakdownLabel}>Late</Text>
                </View>
                <View style={[styles.breakdownCard, { borderLeftColor: '#4f46e5' }]}>
                  <Text style={styles.breakdownCount}>{summary.excused}</Text>
                  <Text style={styles.breakdownLabel}>Excused</Text>
                </View>
              </View>

              <View style={styles.listHeadingRow}>
                <Text style={styles.historyHeading}>
                  Session Logs ({records.length})
                </Text>
                <Text style={styles.filterMetaLabel}>
                  {filterMode === 'current'
                    ? 'Current Month'
                    : filterMode === 'previous'
                    ? 'Previous Month'
                    : 'Historical'}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyView
              title="No Attendance Logs"
              message={`No attendance records found for ${selectedChild?.firstName || 'this student'} for the selected period.`}
            />
          }
          renderItem={({ item }) => {
            const dateObj = item.date ? new Date(item.date) : new Date(`${item.dateString}T00:00:00Z`);
            const weekday = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
              : '';

            return (
              <View style={styles.recordItem}>
                <View style={styles.dateBlock}>
                  <View style={styles.dateRow}>
                    <Text style={styles.recordDate}>{item.dateString}</Text>
                    {weekday ? <Text style={styles.recordDay}>({weekday})</Text> : null}
                  </View>
                  {item.remarks ? (
                    <Text style={styles.recordRemarks}>Note: "{item.remarks}"</Text>
                  ) : null}
                </View>
                <StatusBadge status={item.status} />
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
  summaryContainer: {
    marginBottom: 12,
  },
  rateCard: {
    backgroundColor: '#4338ca',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rateLeft: {
    flex: 1,
  },
  rateLabel: {
    color: '#c7d2fe',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },
  rateSub: {
    color: '#e0e7ff',
    fontSize: 11,
    marginTop: 2,
  },
  rateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  rateCircleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  breakdownCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  breakdownLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  listHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  historyHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterMetaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dateBlock: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  recordDay: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  recordRemarks: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default AttendanceScreen;
