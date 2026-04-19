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

  // Derive base RGB from tint or androidFallbackColor
  const base = tint === 'dark' ? '0,0,0' : '245,245,245';

  if (gradientDirection === 'header') {
    return (
      <LinearGradient
        colors={[
          `rgba(${base},1.0)`,
          `rgba(${base},0.98)`,
          `rgba(${base},0.95)`,
          `rgba(${base},0.85)`,
          `rgba(${base},0.6)`,
          `rgba(${base},0.2)`,
          `rgba(${base},0.0)`,
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
          `rgba(${base},0.0)`,
          `rgba(${base},0.2)`,
          `rgba(${base},0.6)`,
          `rgba(${base},0.85)`,
          `rgba(${base},0.95)`,
          `rgba(${base},0.98)`,
          `rgba(${base},1.0)`,
        ]}
        locations={[0, 0.1, 0.25, 0.4, 0.6, 0.8, 1]}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[style, { backgroundColor: androidFallbackColor }]}>
      {children}
    </View>
  );
}