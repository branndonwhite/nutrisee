import client from './client';

export const analyzeMealImage = async (base64: string) => {
  const response = await client.post('/meals/analyze', { image: base64 });
  return response.data; // { nutrition, image_url }
};

export const analyzeTextMeal = async (description: string, image_url?: string) => {
  const response = await client.post('/meals/analyze-text', {
    description,
    ...(image_url ? { image_url } : {}),
  });
  return response.data; // { nutrition, description }
};

export const logMeal = async (nutrition: {
  food_name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  fiber: number;
  vitamin_a: number;
  vitamin_c: number;
  vitamin_d: number;
  calcium: number;
  cholesterol: number;
  image_url?: string;
  description?: string;
}) => {
  const response = await client.post('/meals/log', nutrition);
  return response.data.meal;
};

export const getMealHistory = async () => {
  const response = await client.get('/meals/history');
  return response.data.meals;
};