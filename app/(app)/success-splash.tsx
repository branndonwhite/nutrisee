import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { NIcon } from '../../assets/images/icon';
import { FONTS } from '../../constants/fonts';

const DARK_RED = '#7B1A0E';
const WHITE = '#FFFFFF';
const LOGO_RED = '#C0391E';
const DISPLAY_DURATION = 2200;

export default function SuccessSplashScreen() {
  const { message, dest } = useLocalSearchParams<{
    message?: string;
    dest?: string;
  }>();

  const displayMessage = message ?? 'Berhasil!';
  const destination = dest ?? '/(app)/home';

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace(destination as any);
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.successText, { opacity: textFadeAnim }]}>
        {displayMessage}
      </Animated.Text>

      <Animated.View
        style={[
          styles.logoCircle,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <NIcon width={80} height={80} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_RED,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  successText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: WHITE,
    textAlign: 'center',
    lineHeight: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LOGO_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});