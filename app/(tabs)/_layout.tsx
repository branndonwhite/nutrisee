import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // 1. THE BAR CONTAINER
        tabBarStyle: styles.tabBar,
        // 2. THE ICON CENTERING LOGIC
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* ROUTE: app/(tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

      {/* ROUTE: This is a trigger button, not a standalone tab page */}
      <Tabs.Screen
        name="camera-trigger"
        options={{
          tabBarIcon: () => (
            <View style={styles.cameraWrapper}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={30} color="white" />
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Stop default navigation
            router.push('/image-scan'); // ROUTER LOCATION for Camera
          },
        }}
      />

      {/* ROUTE: app/(tabs)/explore.tsx */}
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 100,                // Fixed height for the white bar
    paddingTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 35,
    borderTopWidth: 0,
    elevation: 10,             // Shadow for Android
    shadowColor: '#000',       // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'visible',       // CRITICAL: Allows button to pop out
  },
  tabItem: {
    height: 100,                // Must match tabBar height to center icons
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 0 : 0, // Reset default offsets
  },
  cameraWrapper: {
    position: 'relative',      // Takes the button out of the normal row flow
    top: -30,                  // Lifts it significantly above the bar
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF', // NutriSCAN Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F5F5F5',    // Creates the "floating cutout" look
  },
});