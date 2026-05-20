import { LogBox } from 'react-native';
import { useFonts } from 'expo-font';

// Suppress the React Navigation duplicate-linking dev warning.
// launchMode="singleTask" is already set in AndroidManifest.xml — this is
// a false-positive that only fires in dev when 3-button nav is active.
LogBox.ignoreLogs(['Looks like you have configured linking in multiple places']);
import {
  RethinkSans_400Regular,
  RethinkSans_400Regular_Italic,
  RethinkSans_500Medium,
  RethinkSans_500Medium_Italic,
  RethinkSans_600SemiBold,
  RethinkSans_600SemiBold_Italic,
  RethinkSans_700Bold,
  RethinkSans_700Bold_Italic,
  RethinkSans_800ExtraBold,
  RethinkSans_800ExtraBold_Italic,
} from '@expo-google-fonts/rethink-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    RethinkSans_400Regular,
    RethinkSans_400Regular_Italic,
    RethinkSans_500Medium,
    RethinkSans_500Medium_Italic,
    RethinkSans_600SemiBold,
    RethinkSans_600SemiBold_Italic,
    RethinkSans_700Bold,
    RethinkSans_700Bold_Italic,
    RethinkSans_800ExtraBold,
    RethinkSans_800ExtraBold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
