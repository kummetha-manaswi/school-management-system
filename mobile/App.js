import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fetchApiHealth } from './services/api';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleTestHealth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchApiHealth();
      setHealthStatus(data);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to backend');
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    {
      title: 'Parent Mobile App',
      tag: 'Academic Side',
      description: "Attendance, assignments, report cards, fees, and teacher notes.",
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      title: 'Staff Mobile App',
      tag: 'Academic & Admin',
      description: 'Daily attendance marking, gradebook, timetable, and parent comms.',
      color: '#0891b2',
      bg: '#ecfeff',
    },
    {
      title: 'Worker Mobile App',
      tag: 'Operations Side',
      description: 'Cleaning, cooking, security, maintenance, and facility tasks.',
      color: '#059669',
      bg: '#ecfdf5',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Technical Foundation</Text>
          </View>
          <Text style={styles.title}>School Management</Text>
          <Text style={styles.subtitle}>Mobile Application Shell</Text>
        </View>

        {/* Target Persona Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Mobile Personas</Text>
          <Text style={styles.sectionSubtitle}>
            Modular foundation ready for multi-role personas:
          </Text>

          {personas.map((item, index) => (
            <View key={index} style={[styles.card, { borderLeftColor: item.color }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.personaTag, { backgroundColor: item.bg }]}>
                  <Text style={[styles.personaTagText, { color: item.color }]}>{item.tag}</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* Backend Connectivity Test */}
        <View style={styles.testCard}>
          <Text style={styles.testTitle}>Backend Health Integration</Text>
          <Text style={styles.testSubtitle}>Test REST API connectivity from mobile environment</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleTestHealth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Test API Health</Text>
            )}
          </TouchableOpacity>

          {healthStatus && (
            <View style={styles.statusSuccess}>
              <Text style={styles.statusSuccessTitle}>Status: {healthStatus.status?.toUpperCase()}</Text>
              <Text style={styles.statusSuccessBody}>{healthStatus.message}</Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.statusError}>
              <Text style={styles.statusErrorTitle}>Connection Error</Text>
              <Text style={styles.statusErrorBody}>{errorMsg}</Text>
            </View>
          )}
        </View>

        {/* Architecture Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Architecture: Person 1 (Academic/Parent) & Person 2 (Operations/Worker)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: {
    color: '#4338ca',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  personaTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  personaTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  testCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  testSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusSuccess: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  statusSuccessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  statusSuccessBody: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  statusError: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  statusErrorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9f1239',
  },
  statusErrorBody: {
    fontSize: 12,
    color: '#be123c',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
