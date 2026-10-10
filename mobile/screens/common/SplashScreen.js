import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>SM</Text>
      </View>
      <Text style={styles.appName}>School Management</Text>
      <Text style={styles.appTagline}>Parent Mobile Portal</Text>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.loadingText}>Restoring secure session...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appTagline: {
    color: '#c7d2fe',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#e0e7ff',
    fontSize: 13,
  },
});

export default SplashScreen;
