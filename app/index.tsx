import { useEffect, useRef } from 'react';
import { StyleSheet, Image, ImageBackground, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function IndexScreen() {
  const router = useRouter();
  const floatY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    (async () => {
      const MINIMUM_MS = 2500;
      const [route] = await Promise.all([
        (async (): Promise<string> => {
          const token = await SecureStore.getItemAsync('token');
          if (!token) return '/(auth)/register';
          const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
          if (onboardingComplete === 'true') return '/(app)/home';
          await SecureStore.deleteItemAsync('token');
          return '/(auth)/register';
        })(),
        new Promise<void>(resolve => setTimeout(resolve, MINIMUM_MS)),
      ]);
      router.replace(route as any);
    })();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/bg/SPLASH_Background.png')}
      style={styles.root}
      resizeMode="cover"
    >
      <Animated.Image
        source={require('../assets/images/bg/SPLASH_Shapes.png')}
        style={[styles.shapes, { transform: [{ translateY: floatY }] }]}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/images/branding/LOGO_Text_White.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shapes: { position: 'absolute', bottom: -20, left: 0, right: 0, width: '100%', aspectRatio: 402 / 453 },
  logo: { width: 200, height: 89 },
});
