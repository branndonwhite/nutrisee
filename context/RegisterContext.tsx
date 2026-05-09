import React, { createContext, useContext, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export const REGISTER_DATA_KEY = 'register_data';

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

// Module-level cache populated by the splash screen before any navigation,
// so RegisterProvider starts with the full data synchronously — no async race.
let _preloaded: Partial<RegisterData> = {};

// Called by the splash screen (async, reads from SecureStore).
export const preloadRegisterData = async (): Promise<Partial<RegisterData>> => {
  try {
    const json = await SecureStore.getItemAsync(REGISTER_DATA_KEY);
    _preloaded = json ? JSON.parse(json) : {};
  } catch {
    _preloaded = {};
  }
  return _preloaded;
};

// Called by the register screen (sync) after it has already read & merged the
// data itself, so the next screen's RegisterProvider starts with correct data.
export const seedPreloadedData = (data: Partial<RegisterData>): void => {
  _preloaded = { ...data };
};

export const RegisterProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialise synchronously from the preloaded cache — no useEffect needed.
  const dataRef = useRef<Partial<RegisterData>>({ ..._preloaded });
  const [data, setDataState] = useState<Partial<RegisterData>>({ ..._preloaded });

  const setData = (newData: Partial<RegisterData>) => {
    const updated = { ...dataRef.current, ...newData };
    dataRef.current = updated;
    setDataState(updated);
    SecureStore.setItemAsync(REGISTER_DATA_KEY, JSON.stringify(updated));
  };

  const clearData = () => {
    _preloaded = {};
    dataRef.current = {};
    setDataState({});
    SecureStore.deleteItemAsync(REGISTER_DATA_KEY);
  };

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
