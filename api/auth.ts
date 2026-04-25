import client from './client';
import * as SecureStore from 'expo-secure-store';

export const authenticate = async (email: string, password: string) => {
  const response = await client.post('/auth/authenticate', { email, password });
  const { token, user, isNewUser, hasProfile } = response.data;

  // Always store the token regardless of new/existing user
  await SecureStore.setItemAsync('token', token);

  return { user, isNewUser, hasProfile };
};

export const completeProfile = async (data: {
  nickname: string;
  gender: string;
  date_of_birth: string;
  height: number;
  weight: number;
  activity_level: string;
  diet_goal: string;
  target_weight?: number;
  target_date?: string;
}) => {
  const response = await client.post('/auth/profile', data);
  return response.data.profile;
};