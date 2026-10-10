import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const StatusBadge = ({ status, label }) => {
  const norm = String(status || '').toLowerCase();

  let bg = '#f1f5f9';
  let color = '#475569';

  if (['present', 'pass', 'active', 'verified', 'published', 'completed'].includes(norm)) {
    bg = '#dcfce7';
    color = '#15803d';
  } else if (['absent', 'fail', 'inactive', 'revoked', 'cancelled', 'overdue'].includes(norm)) {
    bg = '#fee2e2';
    color = '#b91c1c';
  } else if (['late', 'pending', 'ongoing', 'due_today'].includes(norm)) {
    bg = '#fef3c7';
    color = '#b45309';
  } else if (['excused', 'scheduled', 'draft', 'due_soon'].includes(norm)) {
    bg = '#e0e7ff';
    color = '#4338ca';
  } else if (['not_recorded', 'upcoming'].includes(norm)) {
    bg = '#f1f5f9';
    color = '#64748b';
  }

  const displayText =
    label ||
    (norm === 'not_recorded'
      ? 'NOT MARKED'
      : norm === 'due_today'
      ? 'DUE TODAY'
      : norm === 'due_soon'
      ? 'DUE SOON'
      : norm.replace(/_/g, ' ').toUpperCase());

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default StatusBadge;
