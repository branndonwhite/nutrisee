import client from './client';
import * as SecureStore from 'expo-secure-store';

export const register = async (email: string, password: string) => {
  const response = await client.post('/auth/register', { email, password });
  const { token, user } = response.data;
  await SecureStore.setItemAsync('token', token);
  return user;
};

export const completeProfile = async (data: {
  nickname: string;
  gender: string;
  date_of_birth: string;
  height: number;
  weight: number;
}) => {
  const response = await client.post('/auth/profile', data);
  return response.data.profile;
};