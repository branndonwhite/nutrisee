import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';

export default function AuthLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="step1" />
        <Stack.Screen name="step2" />
      </Stack>
    </UserProvider>
  );
}