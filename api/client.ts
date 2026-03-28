import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;