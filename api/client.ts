import axios from "axios";
import * as SecureStore from "expo-secure-store";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

export const updateWeight = (data: { weight: number }) =>
  client.put("/profile/weight", data);

export const updateWeightGoal = (data: { weight_goal: number }) =>
  client.put("/profile/weight-goal", data);
