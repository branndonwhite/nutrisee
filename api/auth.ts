import client from './client';
import * as SecureStore from 'expo-secure-store';

export const authenticate = async (email: string, password: string) => {
  const response = await client.post('/auth/authenticate', { email, password });
  const { token, user, isNewUser, hasProfile } = response.data;

  console.log('Token received from API:', token ? `${token.slice(0, 20)}...` : 'NULL');
  await SecureStore.setItemAsync('token', token);
  
  const verify = await SecureStore.getItemAsync('token');
  console.log('Token verified in SecureStore:', verify ? `${verify.slice(0, 20)}...` : 'NULL');

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
  target_weight?: number;   // ← was weight_goal
}) => {
  const response = await client.post('/auth/profile', data);
  return response.data.profile;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
};