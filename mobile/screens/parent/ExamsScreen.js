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
import { getChildExamsAndResults } from '../../services/parentApi';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyView } from '../../components/common/EmptyView';
import { ChildSelector } from '../../components/common/ChildSelector';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ExamsScreen = () => {
  const { selectedChildId, selectedChild } = useChildren();

  const [examsData, setExamsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter mode: 'all' | 'published' | 'upcoming'
  const [filterMode, setFilterMode] = useState('all');

  const loadExams = useCallback(async () => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await getChildExamsAndResults(selectedChildId);
      setExamsData(data);
    } catch (err) {
      setError(err.message || 'Failed to load exams and results.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    setLoading(true);
    setExamsData(null); // Clear previous child data immediately
    loadExams();
  }, [loadExams]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExams();
  };

  if (!selectedChildId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildTitle}>No Student Selected</Text>
        <Text style={styles.noChildText}>Please select a child to view examinations and results.</Text>
      </View>
    );
  }

  const allExams = examsData?.exams || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Apply visual filter tab
  const filteredExams = allExams.filter((exam) => {
    if (filterMode === 'published') {
      return exam.isResultPublished === true;
    }
    if (filterMode === 'upcoming') {
      const examDateStr = exam.examDate ? new Date(exam.examDate).toISOString().slice(0, 10) : '';
      return examDateStr >= todayStr && !exam.isResultPublished;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <ChildSelector />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'all' && styles.filterPillActive]}
          onPress={() => setFilterMode('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive]}>
            All ({allExams.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'published' && styles.filterPillActive]}
          onPress={() => setFilterMode('published')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'published' && styles.filterTextActive]}>
            Published Results ({allExams.filter((e) => e.isResultPublished).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterMode === 'upcoming' && styles.filterPillActive]}
          onPress={() => setFilterMode('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filterMode === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <LoadingView message="Loading exam schedules & reports..." />
      ) : error && !examsData ? (
        <ErrorView message={error} onRetry={loadExams} />
      ) : (
        <FlatList
          data={filteredExams}
          keyExtractor={(item) => String(item.examId)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
          ListHeaderComponent={
            <View style={styles.headerBanner}>
              <Text style={styles.headerTitle}>
                Academic Evaluations for {selectedChild?.firstName || 'Student'}
              </Text>
              <Text style={styles.headerNote}>
                Exam schedules and administrative report cards. Official scores are displayed only after publication.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyView
              title="No Examinations Found"
              message={`No exams match the selected filter for ${selectedChild?.firstName || 'this student'}.`}
            />
          }
          renderItem={({ item }) => {
            const isPublished = Boolean(item.isResultPublished);
            const result = item.result;

            return (
              <View style={[styles.card, isPublished && styles.cardPublished]}>
                {/* Header with Type & Publication Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <View style={styles.subjectBadge}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{item.examType.toUpperCase()}</Text>
                    </View>
                  </View>

                  {isPublished ? (
                    <View style={styles.publishedPill}>
                      <Text style={styles.publishedPillText}>✓ PUBLISHED</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingPill}>
                      <Text style={styles.pendingPillText}>🔒 PENDING</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.examTitle}>{item.title}</Text>

                {/* Exam Details */}
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleText}>
                    📅 {item.examDate ? new Date(item.examDate).toLocaleDateString() : 'TBD'} • {item.startTime} - {item.endTime}
                  </Text>
                  <Text style={styles.marksMeta}>
                    Max: {item.maxMarks} pts | Passing: {item.passingMarks} pts
                  </Text>
                </View>

                {/* Publication Privacy Enforcement */}
                {isPublished ? (
                  <View style={styles.resultBox}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultHeaderTitle}>Official Performance</Text>
                      {result ? <StatusBadge status={result.status} /> : null}
                    </View>

                    {result ? (
                      <View style={styles.scoreRow}>
                        <View style={styles.scoreCol}>
                          <Text style={styles.scoreLabel}>Marks Scored</Text>
                          <Text style={styles.scoreValue}>
                            {result.isAbsent ? 'ABSENT' : `${result.marksObtained} / ${item.maxMarks}`}
                          </Text>
                        </View>
                        <View style={[styles.scoreCol, styles.scoreColBorder]}>
                          <Text style={styles.scoreLabel}>Percentage</Text>
                          <Text style={styles.scoreValue}>{result.percentage}%</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.noScoreText}>Score entry in progress by teaching staff.</Text>
                    )}

                    {result?.remarks ? (
                      <Text style={styles.remarksText}>
                        Teacher Remarks: "{result.remarks}"
                      </Text>
                    ) : null}

                    {item.resultsPublishedAt ? (
                      <Text style={styles.publishedTimestamp}>
                        Published on: {new Date(item.resultsPublishedAt).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.shieldedBox}>
                    <Text style={styles.shieldedTitle}>Results Pending Publication</Text>
                    <Text style={styles.shieldedText}>
                      Evaluation scores and report cards remain confidential until officially approved and published by school administration.
                    </Text>
                  </View>
                )}
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
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312e81',
  },
  headerNote: {
    fontSize: 11,
    color: '#4f46e5',
    marginTop: 2,
    lineHeight: 15,
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
  cardPublished: {
    borderColor: '#cbd5e1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
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
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  publishedPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  publishedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  pendingPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.3,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  scheduleRow: {
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  marksMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  resultBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  scoreColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 2,
  },
  noScoreText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  remarksText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 8,
  },
  publishedTimestamp: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'right',
  },
  shieldedBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  shieldedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  shieldedText: {
    fontSize: 11,
    color: '#b45309',
    lineHeight: 15,
  },
});

export default ExamsScreen;
