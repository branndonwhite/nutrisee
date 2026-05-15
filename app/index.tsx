import { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ImageBackground, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SplashScreen() {
  const router = useRouter();
  const floatY = useRef(new Animated.Value(10)).current;

  // Gentle float: starts 10 px below rest position, drifts up to 0, loops
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 10,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    (async () => {
      const MINIMUM_MS = 2500;

      // Run routing logic and minimum timer in parallel; navigate only after
      // both finish so the splash is always visible for at least 2.5 seconds.
      const [route] = await Promise.all([
        (async (): Promise<string> => {
          const token = await SecureStore.getItemAsync('token');
          if (!token) return '/(auth)/register';

          const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
          if (onboardingComplete === 'true') {
            return '/(app)/home';
          } else {
            // Onboarding not finished — clear the token so the user must log in
            // again. register_data is kept so getOnboardingRoute can resume from
            // the last incomplete step after they authenticate.
            await SecureStore.deleteItemAsync('token');
            return '/(auth)/register';
          }
        })(),
        new Promise<void>(resolve => setTimeout(resolve, MINIMUM_MS)),
      ]);

      router.replace(route as any);
    })();
  }, []);

  // Mirror the native splash visually so there is no blank flash between the
  // native splash hiding (after fonts load) and the router pushing a screen.
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
      <View style={styles.center}>
        <Image
          source={require('../assets/images/branding/LOGO_Text_White.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  shapes: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    width: '100%',
    aspectRatio: 402 / 453,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 89,
  },
});
