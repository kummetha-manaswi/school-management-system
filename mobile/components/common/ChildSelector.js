import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useChildren } from '../../hooks/useChildren';

/**
 * ChildSelector Component
 * 
 * Provides an accessible horizontal selector allowing parents with multiple
 * verified children to quickly toggle the active student context across all academic screens.
 */
export const ChildSelector = () => {
  const { children, selectedChildId, selectChild } = useChildren();

  if (!children || children.length === 0) {
    return null;
  }

  // If parent only has 1 verified child, show single child badge
  if (children.length === 1) {
    const child = children[0];
    return (
      <View style={styles.singleContainer}>
        <View style={styles.childAvatar}>
          <Text style={styles.avatarText}>
            {child.firstName ? child.firstName.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.singleInfo}>
          <Text style={styles.singleName}>{child.firstName} {child.lastName}</Text>
          <Text style={styles.singleClass}>
            {child.className} {child.section ? `• Sec ${child.section}` : ''} • Adm: {child.admissionNumber}
          </Text>
        </View>
      </View>
    );
  }

  // Multi-child switcher
  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Select Child:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {children.map((child) => {
          const isSelected = child.studentId === selectedChildId;
          return (
            <TouchableOpacity
              key={child.studentId}
              onPress={() => selectChild(child.studentId)}
              style={[styles.pill, isSelected ? styles.pillSelected : styles.pillUnselected]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.pillAvatar,
                  isSelected ? styles.pillAvatarSelected : styles.pillAvatarUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.avatarTextSmall,
                    isSelected ? styles.avatarTextSelected : styles.avatarTextUnselected,
                  ]}
                >
                  {child.firstName ? child.firstName.charAt(0).toUpperCase() : 'C'}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.pillName,
                    isSelected ? styles.pillNameSelected : styles.pillNameUnselected,
                  ]}
                >
                  {child.firstName} {child.lastName}
                </Text>
                <Text
                  style={[
                    styles.pillMeta,
                    isSelected ? styles.pillMetaSelected : styles.pillMetaUnselected,
                  ]}
                >
                  {child.className} {child.section || ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scrollList: {
    paddingVertical: 2,
    gap: 8,
  },
  singleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  singleInfo: {
    flex: 1,
  },
  singleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  singleClass: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  pillUnselected: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  pillAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pillAvatarSelected: {
    backgroundColor: '#ffffff',
  },
  pillAvatarUnselected: {
    backgroundColor: '#e2e8f0',
  },
  avatarTextSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarTextSelected: {
    color: '#4f46e5',
  },
  avatarTextUnselected: {
    color: '#64748b',
  },
  pillName: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillNameSelected: {
    color: '#ffffff',
  },
  pillNameUnselected: {
    color: '#334155',
  },
  pillMeta: {
    fontSize: 10,
    fontWeight: '500',
  },
  pillMetaSelected: {
    color: '#e0e7ff',
  },
  pillMetaUnselected: {
    color: '#64748b',
  },
});

export default ChildSelector;
