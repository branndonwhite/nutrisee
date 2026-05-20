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

      await SplashScreen.hideAsync();
      router.replace(route as any);
    })();
  }, []);

  return <View style={{ flex: 1, backgroundColor: '#1a237e' }} />;
}
