import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, type User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!token && !!user;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  };

  const login = async (username: string, password: string) => {
    const response = await api.authAPI.login(username, password);
    const { access, user: newUser } = response;
    
    localStorage.setItem('token', access);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(access);
    setUser(newUser);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.authAPI.register(username, email, password);
    const { access, user: newUser } = response;
    
    localStorage.setItem('token', access);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(access);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
