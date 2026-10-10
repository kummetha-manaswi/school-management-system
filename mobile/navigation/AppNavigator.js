import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/parent/HomeScreen';
import { ChildrenListScreen } from '../screens/parent/ChildrenListScreen';
import { ChildProfileScreen } from '../screens/parent/ChildProfileScreen';
import { AttendanceScreen } from '../screens/parent/AttendanceScreen';
import { AssignmentsScreen } from '../screens/parent/AssignmentsScreen';
import { ExamsScreen } from '../screens/parent/ExamsScreen';
import { ProfileScreen } from '../screens/parent/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Icon Helper
const TabIcon = ({ label, focused }) => {
  let icon = '📄';
  if (label === 'Home') icon = '🏠';
  else if (label === 'Children') icon = '👥';
  else if (label === 'Attendance') icon = '📅';
  else if (label === 'Homework') icon = '📝';
  else if (label === 'Exams') icon = '📊';
  else if (label === 'Profile') icon = '⚙️';

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>{icon}</Text>
    </View>
  );
};

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '700',
          color: '#0f172a',
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: 'Parent Portal Home' }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenListScreen}
        options={{ headerTitle: 'My Verified Children' }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ headerTitle: 'Attendance Record' }}
      />
      <Tab.Screen
        name="Homework"
        component={AssignmentsScreen}
        options={{ headerTitle: 'Assignments & Homework' }}
      />
      <Tab.Screen
        name="Exams"
        component={ExamsScreen}
        options={{ headerTitle: 'Exams & Report Cards' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'Parent Profile & Settings' }}
      />
    </Tab.Navigator>
  );
};

// Outer Stack Navigator for modal / pushed detail screens
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '700',
          color: '#0f172a',
        },
        headerTintColor: '#4f46e5',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildProfile"
        component={ChildProfileScreen}
        options={{ headerTitle: 'Student Profile' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    opacity: 0.7,
  },
  iconTextFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});

export default AppNavigator;
