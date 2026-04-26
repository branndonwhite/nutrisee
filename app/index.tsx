import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const shapesOpacity = useRef(new Animated.Value(0)).current;
  const shapesFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 55,
            friction: 9,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(shapesOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Float upward and back, loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shapesFloat, {
          toValue: -16,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(shapesFloat, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/register');
      }
    }, 2000);  // keep your 2s splash duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Image
        source={require('../assets/images/bg/SPLASH_Background.png')}
        style={styles.background}
        resizeMode="cover"
      />

      <Animated.Image
        source={require('../assets/images/bg/SPLASH_Shapes.png')}
        style={[
          styles.shapes,
          {
            opacity: shapesOpacity,
            transform: [{ translateY: shapesFloat }],
          },
        ]}
        resizeMode="cover"
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/branding/LOGO_Text_White.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A2D6E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: W,
    height: H,
  },
  // Anchored to bottom, taller than needed so floating up never gaps
  shapes: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: W,
    height: H * 0.45 + 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: H * 0.08,
  },
  logo: {
    width: W * 0.58,
    height: 72,
  },
});