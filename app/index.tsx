import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const MINIMUM_MS = 2500;

      // Run routing logic and minimum timer in parallel so the native splash
      // is always visible for at least 2.5 seconds.
      const [route] = await Promise.all([
        (async (): Promise<string> => {
          const token = await SecureStore.getItemAsync('token');
          if (!token) return '/(auth)/register';

          const onboardingComplete = await SecureStore.getItemAsync('onboarding_complete');
          if (onboardingComplete === 'true') {
            return '/(app)/home';
          } else {
            await SecureStore.deleteItemAsync('token');
            return '/(auth)/register';
          }
        })(),
        new Promise<void>(resolve => setTimeout(resolve, MINIMUM_MS)),
      ]);

      // Hide the native splash right before navigating — single clean transition.
      await SplashScreen.hideAsync();
      router.replace(route as any);
    })();
  }, []);

  // Native splash is still covering the screen — nothing to render.
  return <View style={{ flex: 1 }} />;
}
