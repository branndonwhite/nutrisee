import React, { createContext, useContext, useState } from 'react';

type RegisterData = {
  email: string;
  password: string;
  nickname: string;
  gender: string;
  date_of_birth: string;
  height: number;
  weight: number;
  activity_level: string;
  diet_goal: string;
  weight_goal: number;
};

type RegisterContextType = {
  data: Partial<RegisterData>;
  setData: (data: Partial<RegisterData>) => void;
  clearData: () => void;
};

const RegisterContext = createContext<RegisterContextType | null>(null);

export const RegisterProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setDataState] = useState<Partial<RegisterData>>({});

  const setData = (newData: Partial<RegisterData>) => {
    setDataState(prev => ({ ...prev, ...newData }));
  };

  const clearData = () => setDataState({});

  return (
    <RegisterContext.Provider value={{ data, setData, clearData }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (!context) throw new Error('useRegister must be used within RegisterProvider');
  return context;
};