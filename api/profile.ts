import client from './client';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const getProfile = async () => {
  const response = await client.get('/profile');
  return response.data.profile;
};

export const uploadProfileImage = async (uri: string) => {
  // Compress to square before uploading
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: 'base64',
  });

  const response = await client.post('/profile/avatar', { image: base64 });
  return response.data.avatar_url;
};