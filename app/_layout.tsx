import { useFonts } from 'expo-font';
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
import { Stack } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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