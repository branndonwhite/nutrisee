import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { NIcon } from '../assets/images/icon';
import { FONTS } from '../constants/fonts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScanLoadingOverlayProps {
  visible: boolean;
  /** First step label — shown with ✅ when step2 starts */
  step1Label?: string;
  /** Second step label — shown with trailing '...' while in progress */
  step2Label?: string;
  /** When true, step 1 is done and step 2 is in progress */
  step?: 1 | 2;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScanLoadingOverlay({
  visible,
  step1Label = 'Mendeteksi Makanan',
  step2Label = 'Mengecek Kandungan Nutrisi',
  step = 1,
}: ScanLoadingOverlayProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Entrance animation ──
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // ── Continuous pulse on the logo ──
  useEffect(() => {
    if (!visible) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdropWrapper, { opacity: opacityAnim }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.backdropDim} />
          </BlurView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.backdropDim]} />
        )}

        {/* Centered content */}
        <Animated.View
          style={[
            styles.content,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Logo circle with pulse */}
          <Animated.View
            style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}
          >
            <NIcon width={80} height={80} />
          </Animated.View>

          {/* Step labels */}
          <View style={styles.stepsContainer}>
            {/* Step 1 */}
            <Text style={styles.stepText}>
              {step1Label}{' '}
              {step >= 2 ? '✅' : <Text style={styles.ellipsis}>...</Text>}
            </Text>

            {/* Step 2 — only visible once step 1 is done */}
            {step >= 2 && (
              <Text style={styles.stepText}>
                {step2Label}
                <Text style={styles.ellipsis}>...</Text>
              </Text>
            )}
          </View>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdropWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#CC4A1A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CC4A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  stepsContainer: {
    alignItems: 'center',
    gap: 6,
  },
  stepText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ellipsis: {
    color: '#FFFFFF',
  },
});