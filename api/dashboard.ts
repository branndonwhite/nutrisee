import client from './client';

export const getAIOverview = async (): Promise<string> => {
  const response = await client.get('/dashboard/ai-overview');
  return response.data.overview;
};

export interface DailyStats {
  profile: {
    nickname: string;
    gender: string;
    avatar_url: string | null;
  };
  today: {
    calorie_goal: number;
    calories_consumed: number;
    calories_remaining: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    fiber: number;
  };
  progression: {
    date: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    fiber: number;
  }[];
  pencapaian: {
    label: string;   // 'Defisit' | 'Surplus'
    value: number;   // kkal
    unit: string;
    description: string;
  };
  diet: {
    current_weight: number;
    target_weight: number | null;
    kg_remaining: number | null;
    direction: 'turun' | 'naik' | null;
  };
  favorit: {
    food_name: string;
    count: number;
  } | null;
  macro_goals: {
    carbs: number;
    protein: number;
    fat: number;
    sugar: number;
    fiber: number;
  };
}

export const getDailyStats = async (): Promise<DailyStats> => {
  const response = await client.get('/dashboard/daily-stats');
  return response.data;
};