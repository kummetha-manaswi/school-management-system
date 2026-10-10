import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import {
  getDashboardSummary,
  getChildAttendance,
  getChildAssignments,
  getChildExamsAndResults,
} from '../../services/parentApi';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { ChildSelector } from '../../components/common/ChildSelector';
import { StatusBadge } from '../../components/common/StatusBadge';

export const HomeScreen = ({ navigation }) => {
  const { parentUser } = useAuth();
  const { children, selectedChild, selectedChildId } = useChildren();

  const [summaryData, setSummaryData] = useState(null);
  const [childAttendance, setChildAttendance] = useState(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [latestPublishedResult, setLatestPublishedResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);

      // 1. Load aggregate parent summary
      const summary = await getDashboardSummary();
      setSummaryData(summary);

      // 2. Load child-specific detailed metrics if a verified child is selected
      if (selectedChildId) {
        const [attRes, assignRes, examsRes] = await Promise.allSettled([
          getChildAttendance(selectedChildId, { limit: 5 }),
          getChildAssignments(selectedChildId, { limit: 3 }),
          getChildExamsAndResults(selectedChildId),
        ]);

        if (attRes.status === 'fulfilled') {
          setChildAttendance(attRes.value);
        } else {
          setChildAttendance(null);
        }

        if (assignRes.status === 'fulfilled' && assignRes.value?.assignments) {
          setUpcomingAssignments(assignRes.value.assignments.slice(0, 3));
        } else {
          setUpcomingAssignments([]);
        }

        if (examsRes.status === 'fulfilled' && examsRes.value?.exams) {
          const allExams = examsRes.value.exams;
          const todayStr = new Date().toISOString().slice(0, 10);

          // Filter upcoming exams
          const upcoming = allExams
            .filter((e) => {
              const examDateStr = e.examDate ? new Date(e.examDate).toISOString().slice(0, 10) : '';
              return examDateStr >= todayStr;
            })
            .slice(0, 2);
          setUpcomingExams(upcoming);

          // Find latest published exam with actual result
          const publishedWithResult = allExams.find(
            (e) => e.isResultPublished === true && e.result !== null
          );
          setLatestPublishedResult(publishedWithResult || null);
        } else {
          setUpcomingExams([]);
          setLatestPublishedResult(null);
        }
      } else {
        setChildAttendance(null);
        setUpcomingAssignments([]);
        setUpcomingExams([]);
        setLatestPublishedResult(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load parent dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    setLoading(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !refreshing) {
    return <LoadingView message="Loading parent dashboard..." />;
  }

  if (error && !summaryData) {
    return <ErrorView message={error} onRetry={loadDashboardData} />;
  }

  // Find summary metrics for currently selected child
  const activeChildSummary =
    selectedChild && summaryData?.children
      ? summaryData.children.find((c) => c.studentId === selectedChild.studentId)
      : summaryData?.children?.[0] || null;

  // Attendance rate and trend calculations based strictly on real records
  const attSummary = childAttendance?.summary;
  const recentRecords = childAttendance?.records || [];
  const hasSufficientAttendanceData = recentRecords.length >= 3;

  return (
    <View style={styles.container}>
      <ChildSelector />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.greeting}>Good Day,</Text>
            <Text style={styles.parentName}>
              {parentUser?.name || `${parentUser?.firstName || 'Parent'}`}
            </Text>
            <Text style={styles.summaryMeta}>
              {children.length} {children.length === 1 ? 'verified child' : 'verified children'} linked
            </Text>
          </View>
          {selectedChild ? (
            <View style={styles.activeChildBadge}>
              <Text style={styles.activeChildLabel}>Viewing</Text>
              <Text style={styles.activeChildName}>{selectedChild.firstName}</Text>
            </View>
          ) : null}
        </View>

        {/* Selected Child Section */}
        {selectedChild ? (
          <>
            {/* 1. Today's Attendance & Rate Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle}>Daily Attendance</Text>
                  <Text style={styles.cardSubtitle}>
                    {selectedChild.firstName} • {selectedChild.className} {selectedChild.section || ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Attendance')}
                  accessibilityRole="button"
                  accessibilityLabel="View full attendance history"
                >
                  <Text style={styles.cardActionText}>History ›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.attendanceRow}>
                {/* Today's status */}
                <View style={styles.attendanceCol}>
                  <Text style={styles.metricLabel}>Today's Status</Text>
                  <View style={styles.badgeWrap}>
                    <StatusBadge
                      status={activeChildSummary?.todayAttendance?.status || 'not_recorded'}
                      label={
                        activeChildSummary?.todayAttendance?.status === 'not_recorded'
                          ? 'Not Marked'
                          : undefined
                      }
                    />
                  </View>
                  {activeChildSummary?.todayAttendance?.remarks ? (
                    <Text style={styles.remarksSmall}>
                      "{activeChildSummary.todayAttendance.remarks}"
                    </Text>
                  ) : null}
                </View>

                {/* Overall Attendance Rate */}
                <View style={[styles.attendanceCol, styles.attendanceColBorder]}>
                  <Text style={styles.metricLabel}>Attendance Rate</Text>
                  <Text style={styles.rateValueText}>
                    {attSummary?.attendanceRate !== undefined ? `${attSummary.attendanceRate}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricSub}>
                    {attSummary?.totalDays ? `${attSummary.present} of ${attSummary.totalDays} days` : 'No sessions'}
                  </Text>
                </View>
              </View>

              {/* Recent Attendance Trend (Only shown if sufficient real data exists) */}
              <View style={styles.trendContainer}>
                <Text style={styles.trendLabel}>Recent Session Log:</Text>
                {hasSufficientAttendanceData ? (
                  <View style={styles.trendPillsRow}>
                    {recentRecords.slice(0, 5).map((r) => (
                      <View key={String(r.id || r.dateString)} style={styles.trendPillItem}>
                        <StatusBadge status={r.status} label={r.status.charAt(0).toUpperCase()} />
                        <Text style={styles.trendDateText}>
                          {r.dateString ? r.dateString.slice(5) : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.insufficientTrendText}>
                    Insufficient historical sessions recorded to display trend.
                  </Text>
                )}
              </View>
            </View>

            {/* 2. Homework & Assignments Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle}>Homework & Deadlines</Text>
                  <Text style={styles.cardSubtitle}>Active published tasks for class</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Homework')}
                  accessibilityRole="button"
                  accessibilityLabel="View all assignments"
                >
                  <Text style={styles.cardActionText}>All Tasks ›</Text>
                </TouchableOpacity>
              </View>

              {upcomingAssignments.length > 0 ? (
                <View style={styles.itemsList}>
                  {upcomingAssignments.map((a) => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    let urgencyStatus = 'upcoming';
                    if (a.isOverdue) urgencyStatus = 'overdue';
                    else if (a.dueDateString === todayStr) urgencyStatus = 'due_today';

                    return (
                      <View key={String(a.id)} style={styles.assignmentItem}>
                        <View style={styles.assignmentTop}>
                          <Text style={styles.subjectText}>{a.subject}</Text>
                          <StatusBadge status={urgencyStatus} />
                        </View>
                        <Text style={styles.itemTitle}>{a.title}</Text>
                        <View style={styles.itemMetaRow}>
                          <Text style={styles.itemMeta}>📅 Due: {a.dueDateString || 'No date'}</Text>
                          <Text style={styles.itemMeta}>Max: {a.maxMarks} pts</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={styles.emptyCardTitle}>No Pending Assignments</Text>
                  <Text style={styles.emptyCardDesc}>
                    There are currently no active published homework assignments for {selectedChild.className}.
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Upcoming Exams Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle}>Upcoming Exams</Text>
                  <Text style={styles.cardSubtitle}>Scheduled assessments</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Exams')}
                  accessibilityRole="button"
                  accessibilityLabel="View all exams"
                >
                  <Text style={styles.cardActionText}>Schedules ›</Text>
                </TouchableOpacity>
              </View>

              {upcomingExams.length > 0 ? (
                <View style={styles.itemsList}>
                  {upcomingExams.map((exam) => (
                    <View key={String(exam.examId)} style={styles.examItem}>
                      <View style={styles.examTop}>
                        <Text style={styles.subjectText}>{exam.subject}</Text>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>{exam.examType?.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemTitle}>{exam.title}</Text>
                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemMeta}>
                          📅 {new Date(exam.examDate).toLocaleDateString()} ({exam.startTime} - {exam.endTime})
                        </Text>
                        <Text style={styles.itemMeta}>Max Marks: {exam.maxMarks}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={styles.emptyCardTitle}>No Upcoming Exams</Text>
                  <Text style={styles.emptyCardDesc}>
                    No future exams or assessments are currently scheduled for this class.
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Latest Published Result Snapshot */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.cardTitle}>Latest Report Card</Text>
                  <Text style={styles.cardSubtitle}>Official published evaluation</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Exams')}
                  accessibilityRole="button"
                  accessibilityLabel="View full exam results"
                >
                  <Text style={styles.cardActionText}>All Results ›</Text>
                </TouchableOpacity>
              </View>

              {latestPublishedResult ? (
                <View style={styles.resultItem}>
                  <View style={styles.resultItemHeader}>
                    <Text style={styles.resultExamTitle}>{latestPublishedResult.title}</Text>
                    <StatusBadge status={latestPublishedResult.result?.status} />
                  </View>
                  <Text style={styles.resultSubject}>{latestPublishedResult.subject}</Text>

                  <View style={styles.resultMetricsRow}>
                    <View style={styles.resultMetricBox}>
                      <Text style={styles.resultMetricLabel}>Marks Obtained</Text>
                      <Text style={styles.resultMetricValue}>
                        {latestPublishedResult.result?.isAbsent
                          ? 'ABSENT'
                          : `${latestPublishedResult.result?.marksObtained} / ${latestPublishedResult.maxMarks}`}
                      </Text>
                    </View>
                    <View style={styles.resultMetricBox}>
                      <Text style={styles.resultMetricLabel}>Percentage</Text>
                      <Text style={styles.resultMetricValue}>
                        {latestPublishedResult.result?.percentage}%
                      </Text>
                    </View>
                  </View>

                  {latestPublishedResult.result?.remarks ? (
                    <Text style={styles.resultRemarks}>
                      Teacher Remarks: "{latestPublishedResult.result.remarks}"
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={styles.emptyCardTitle}>No Published Results Available</Text>
                  <Text style={styles.emptyCardDesc}>
                    Official evaluation scores will be displayed here once finalized and formally published by school administration.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noChildrenCard}>
            <Text style={styles.noChildrenTitle}>No Verified Children Found</Text>
            <Text style={styles.noChildrenDesc}>
              Your parent account currently has no active, administratively verified student relationships. Please contact the school office to link your student.
            </Text>
          </View>
        )}

        {/* Quick Navigation Modules */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Navigation</Text>
        </View>

        <View style={styles.quickNavGrid}>
          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Children')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickNavIcon}>👥</Text>
            <Text style={styles.quickNavLabel}>My Children</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Attendance')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickNavIcon}>📅</Text>
            <Text style={styles.quickNavLabel}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Homework')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickNavIcon}>📝</Text>
            <Text style={styles.quickNavLabel}>Homework</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Exams')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickNavIcon}>📊</Text>
            <Text style={styles.quickNavLabel}>Exams</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeBanner: {
    backgroundColor: '#4338ca',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greeting: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  parentName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryMeta: {
    color: '#e0e7ff',
    fontSize: 12,
    marginTop: 4,
  },
  activeChildBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeChildLabel: {
    color: '#e0e7ff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeChildName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 8,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
    marginLeft: 8,
  },
  attendanceRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  attendanceCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  attendanceColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  badgeWrap: {
    marginBottom: 4,
  },
  remarksSmall: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  rateValueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  trendContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  trendPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trendPillItem: {
    alignItems: 'center',
  },
  trendDateText: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  insufficientTrendText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  itemsList: {
    gap: 10,
  },
  assignmentItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  assignmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  examItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  examTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4338ca',
  },
  resultItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  resultExamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  resultSubject: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  resultMetricsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  resultMetricBox: {
    alignItems: 'center',
  },
  resultMetricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultMetricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 2,
  },
  resultRemarks: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyCardBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  emptyCardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 15,
    maxWidth: 260,
  },
  noChildrenCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 16,
  },
  noChildrenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  noChildrenDesc: {
    fontSize: 12,
    color: '#b45309',
    lineHeight: 16,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickNavItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickNavIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickNavLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});

export default HomeScreen;
