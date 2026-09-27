import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types';

import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser as apiGetCurrentUser,
} from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  authenticated: boolean;
  isAuthenticated: boolean;

  login:
  ((email: string, password: string) => Promise<AuthResponse>) &
  ((credentials: LoginRequest) => Promise<AuthResponse>);

  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (!storedToken) {
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiGetCurrentUser(storedToken);

        setToken(storedToken);
        setUser(currentUser);

        localStorage.setItem(
          'auth_user',
          JSON.stringify(currentUser)
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : '';

        if (
          errorMessage.includes('401') ||
          errorMessage.toLowerCase().includes('unauthorized')
        ) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');

          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);

          const cachedUser = localStorage.getItem('auth_user');

          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser) as User);
            } catch {
              setUser(null);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    emailOrCredentials: string | LoginRequest,
    password?: string
  ): Promise<AuthResponse> => {
    const authResponse =
      typeof emailOrCredentials === 'string'
        ? await apiLogin(
          emailOrCredentials,
          password ?? ''
        )
        : await apiLogin(emailOrCredentials);

    localStorage.setItem(
      'auth_token',
      authResponse.accessToken
    );

    localStorage.setItem(
      'auth_user',
      JSON.stringify(authResponse.user)
    );

    setToken(authResponse.accessToken);
    setUser(authResponse.user);

    return authResponse;
  };

  const register = async (
    userData: RegisterRequest
  ): Promise<AuthResponse> => {
    const authResponse = await apiRegister(userData);

    localStorage.setItem(
      'auth_token',
      authResponse.accessToken
    );

    localStorage.setItem(
      'auth_user',
      JSON.stringify(authResponse.user)
    );

    setToken(authResponse.accessToken);
    setUser(authResponse.user);

    return authResponse;
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);

    localStorage.setItem(
      'auth_user',
      JSON.stringify(updatedUser)
    );
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);

  const value: AuthContextType = {
    user,
    token,
    loading,
    authenticated: isAuthenticated,
    isAuthenticated,
    login: login as AuthContextType['login'],
    register,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};