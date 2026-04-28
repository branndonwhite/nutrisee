import client from './client';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export const getProfile = async () => {
  const response = await client.get('/profile');
  return response.data.profile;
};

export const uploadProfileImage = async (uri: string) => {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, { encoding: 'base64' });
  const response = await client.post('/profile/avatar', { image: base64 });
  return response.data.avatar_url;
};

export const getAITips = async () => {
  const response = await client.get('/profile/ai-tips');
  return response.data.tips;
};

export const getWeeklyStats = async () => {
  const response = await client.get('/profile/weekly-stats');
  return response.data;
};

export const getWeightTarget = async () => {
  const response = await client.get('/profile/weight-target');
  return response.data;
};

export const getBadges = async () => {
  const response = await client.get('/badges');
  return response.data; // { badges: [{key, achieved}], stats }
};

export const markShared = async () => {
  await client.post('/badges/shared');
};