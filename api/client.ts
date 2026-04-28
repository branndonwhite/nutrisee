import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getCalendars } from 'expo-localization';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

client.interceptors.request.use(async (config) => {
  // Attach auth token
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach device timezone — backend uses this for all date queries
  try {
    const calendars = getCalendars();
    const timezone = calendars[0]?.timeZone ?? 'Asia/Jakarta';
    config.headers['X-Timezone'] = timezone;
  } catch {
    config.headers['X-Timezone'] = 'Asia/Jakarta';
  }

  return config;
});

export default client;