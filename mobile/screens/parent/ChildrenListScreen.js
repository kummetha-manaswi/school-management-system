import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useChildren } from '../../hooks/useChildren';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyView } from '../../components/common/EmptyView';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ChildrenListScreen = ({ navigation }) => {
  const {
    children,
    isLoadingChildren,
    childrenError,
    refreshChildren,
    selectChild,
    selectedChildId,
  } = useChildren();

  const handleSelectChild = (studentId) => {
    selectChild(studentId);
    navigation.navigate('ChildProfile', { studentId });
  };

  const handleQuickActivate = (studentId) => {
    selectChild(studentId);
  };

  if (isLoadingChildren && children.length === 0) {
    return <LoadingView message="Loading verified children..." />;
  }

  if (childrenError && children.length === 0) {
    return <ErrorView message={childrenError} onRetry={refreshChildren} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={children}
        keyExtractor={(item) => item.studentId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingChildren}
            onRefresh={refreshChildren}
            colors={['#4f46e5']}
          />
        }
        ListHeaderComponent={
          children.length > 0 ? (
            <View style={styles.headerBanner}>
              <Text style={styles.headerTitle}>Verified Student Links</Text>
              <Text style={styles.headerSubtitle}>
                Select a student to view their attendance, assignments, and examination reports.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyView
            title="No Verified Children"
            message="No verified parent-student relationships are linked to your account. Contact the school office to verify relationships."
          />
        }
        renderItem={({ item }) => {
          const isSelected = item.studentId === selectedChildId;

          return (
            <View style={[styles.card, isSelected && styles.cardActive]}>
              {/* Card Top Header */}
              <View style={styles.cardTop}>
                <View style={[styles.avatar, isSelected && styles.avatarActive]}>
                  <Text style={styles.avatarText}>
                    {item.firstName ? item.firstName.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.classSectionText}>
                    {item.className} {item.section ? `• Section ${item.section}` : ''}
                  </Text>
                  <Text style={styles.admissionText}>Adm No: {item.admissionNumber}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>✓ ACTIVE</Text>
                  </View>
                ) : (
                  <StatusBadge status={item.status} />
                )}
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Relationship</Text>
                  <Text style={styles.detailValue}>
                    {item.relationshipType ? item.relationshipType.toUpperCase() : 'GUARDIAN'}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Roll Number</Text>
                  <Text style={styles.detailValue}>{item.rollNumber || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Blood Group</Text>
                  <Text style={styles.detailValue}>{item.bloodGroup || 'Not Recorded'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Verified</Text>
                  <Text style={styles.detailValue}>
                    {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : 'Active'}
                  </Text>
                </View>
              </View>

              {/* Actions Footer */}
              <View style={styles.actionsFooter}>
                {!isSelected && (
                  <TouchableOpacity
                    style={styles.activateButton}
                    onPress={() => handleQuickActivate(item.studentId)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch active view to ${item.firstName}`}
                  >
                    <Text style={styles.activateButtonText}>Set as Active Child</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.profileButton, isSelected && styles.profileButtonFull]}
                  onPress={() => handleSelectChild(item.studentId)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View full profile of ${item.firstName}`}
                >
                  <Text style={styles.profileButtonText}>
                    {isSelected ? 'View Full Academic Profile ›' : 'Details ›'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBanner: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  cardActive: {
    borderColor: '#4f46e5',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarActive: {
    backgroundColor: '#4f46e5',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  classSectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4f46e5',
    marginTop: 1,
  },
  admissionText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    width: '48%',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    alignItems: 'center',
  },
  activateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  activateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  profileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  profileButtonFull: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
});

export default ChildrenListScreen;
