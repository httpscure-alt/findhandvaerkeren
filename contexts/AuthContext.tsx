import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'CONSUMER' | 'PARTNER' | 'ADMIN';
  avatarUrl: string | null;
  location: string | null;
  ownedCompany?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // Use stored user data (offline mode)
      try {
        const user = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(user);
        setIsLoading(false);
        
        // Try to verify with API in background (non-blocking) - only if API is configured
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
          api.getMe()
            .then(({ user: freshUser }) => {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            })
            .catch(() => {
              // API not available, keep using stored user
            });
        }
      } catch {
        setIsLoading(false);
      }
    } else if (storedToken) {
      // Token exists but no user data, try to fetch (only if API is configured)
      setToken(storedToken);
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        api.getMe()
          .then(({ user }) => {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          })
          .catch(() => {
            // API not available, clear invalid token
            localStorage.removeItem('token');
            setToken(null);
          })
          .finally(() => setIsLoading(false));
      } else {
        // No API configured, clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
    } catch (error: any) {
      // API not available, use mock login
      if (error.message === 'API_NOT_AVAILABLE' || error.message.includes('fetch')) {
        // Mock login for offline mode
        const mockUser: User = {
          id: 'mock-user',
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : email.includes('partner') ? 'PARTNER' : 'CONSUMER',
          avatarUrl: null,
          location: null,
        };
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
      } else {
        throw error;
      }
    }
  };

  const register = async (email: string, password: string, name?: string, role?: string) => {
    try {
      const { user, token } = await api.register({ email, password, name, role });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
    } catch (error: any) {
      // API not available, use mock registration
      if (error.message === 'API_NOT_AVAILABLE' || error.message.includes('fetch')) {
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          email,
          name: name || email.split('@')[0],
          role: (role as 'CONSUMER' | 'PARTNER' | 'ADMIN') || 'CONSUMER',
          avatarUrl: null,
          location: null,
        };
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
      } else {
        throw error;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Don't block rendering while loading - show app immediately
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading: false, // Always false to prevent blocking
        isAuthenticated: !!user && !!token,
      }}
    >
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
