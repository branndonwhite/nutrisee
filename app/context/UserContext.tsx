import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of our user data based on the screens
interface UserData {
  email?: string;
  nickname?: string;
  gender?: string;
  height?: string;
  weight?: string;
  restrictions?: string;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({});

  const updateUserData = (newData: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};