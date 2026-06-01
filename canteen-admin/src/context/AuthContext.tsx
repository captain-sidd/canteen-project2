import React, { createContext, useContext, useState, useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import type { UserInterface } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInterface | null;
  login: (token: string, userData: UserInterface) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (token && storedUser) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: UserInterface) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    queryClient.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
