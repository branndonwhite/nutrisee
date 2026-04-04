import { Stack } from 'expo-router';
import { RegisterProvider } from '../../context/RegisterContext';

export default function AuthLayout() {
  return (
    <RegisterProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RegisterProvider>
  );
}