import React from 'react';
import { View, Platform, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: StyleProp<ViewStyle>;
  androidFallbackColor?: string;
  gradientDirection?: 'header' | 'footer' | 'none';
};

export default function BlurContainer({
  children,
  intensity = 60,
  tint = 'light',
  style,
  androidFallbackColor = 'rgba(245,245,245,0.92)',
  gradientDirection = 'none',
}: Props) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={tint} style={style}>
        {children}
      </BlurView>
    );
  }

  // Android — use gradient fade
  if (gradientDirection === 'header') {
    return (
      <LinearGradient
        colors={[
          'rgba(245,245,245,1.0)',   // fully solid at top
          'rgba(245,245,245,0.98)',
          'rgba(245,245,245,0.95)',
          'rgba(245,245,245,0.85)',
          'rgba(245,245,245,0.6)',
          'rgba(245,245,245,0.2)',
          'rgba(245,245,245,0.0)',   // fully transparent at bottom
        ]}
        locations={[0, 0.2, 0.4, 0.6, 0.75, 0.9, 1]}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }

  if (gradientDirection === 'footer') {
    return (
      <LinearGradient
        colors={[
          'rgba(245,245,245,0.0)',   // fully transparent at top
          'rgba(245,245,245,0.2)',
          'rgba(245,245,245,0.6)',
          'rgba(245,245,245,0.85)',
          'rgba(245,245,245,0.95)',
          'rgba(245,245,245,0.98)',
          'rgba(245,245,245,1.0)',   // fully solid at bottom
        ]}
        locations={[0, 0.1, 0.25, 0.4, 0.6, 0.8, 1]}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }

  // Default fallback
  return (
    <View style={[style, { backgroundColor: androidFallbackColor }]}>
      {children}
    </View>
  );
}