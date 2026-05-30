import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUserCoins: (coins: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if we have a token and user in localStorage
    const storedToken = localStorage.getItem('cryptoPulseToken');
    const storedUser = localStorage.getItem('cryptoPulseUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    
    // Store in localStorage
    localStorage.setItem('cryptoPulseToken', userToken);
    localStorage.setItem('cryptoPulseUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear from localStorage
    localStorage.removeItem('cryptoPulseToken');
    localStorage.removeItem('cryptoPulseUser');
  };

  const updateUserCoins = (coins: string[]) => {
    if (user) {
      const updatedUser = { ...user, coins };
      setUser(updatedUser);
      localStorage.setItem('cryptoPulseUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUserCoins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};