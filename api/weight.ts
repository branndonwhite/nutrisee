import client from './client';

export const logWeight = async (data: { weight: number }) => {
  const response = await client.post('/weight/log', data);
  return response.data.entry;
};

export const updateWeightGoal = async (data: { target_weight: number; target_date?: string }) => {
  const response = await client.put('/weight/goal', data);
  return response.data;
};

export const getWeightGoal = async () => {
  const response = await client.get('/weight/goal');
  return response.data;
};

export const getWeightHistory = async (limit = 30) => {
  const response = await client.get(`/weight/history?limit=${limit}`);
  return response.data.history;
};