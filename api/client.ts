import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Request interceptor — attach token + timezone
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const calendars = getCalendars();
    const timezone = calendars[0]?.timeZone ?? 'Asia/Jakarta';
    config.headers['X-Timezone'] = timezone;
  } catch {
    config.headers['X-Timezone'] = 'Asia/Jakarta';
  }

  return config;
});

// Response interceptor — handle expired/invalid token
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      router.replace('/(auth)/register');
    }
    return Promise.reject(error);
  }
);

export default client;