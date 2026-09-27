import axios from 'axios';
import apiClient from './client';

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types';

export type { LoginRequest, RegisterRequest, AuthResponse, User };

/**
 * Parses HTTP/Axios errors into a clean, human-readable message.
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];

      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }

      return 'Validation error occurred.';
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/**
 * Authenticate credentials against backend.
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse>;

export async function login(
  credentials: LoginRequest
): Promise<AuthResponse>;

export async function login(
  emailOrCredentials: string | LoginRequest,
  password?: string
): Promise<AuthResponse> {
  const payload: LoginRequest =
    typeof emailOrCredentials === 'string'
      ? {
        email: emailOrCredentials,
        password: password ?? '',
      }
      : emailOrCredentials;

  try {
    const response = await apiClient.post<AuthResponse>(
      '/api/Auth/login',
      payload
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Register a new user account.
 */
export async function register(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      '/api/Auth/register',
      userData
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Retrieve profile of currently authenticated user.
 */
export async function getCurrentUser(
  token?: string
): Promise<User> {
  try {
    const response = await apiClient.get<User>(
      '/api/Auth/me',
      {
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : undefined,
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Update profile of the currently authenticated user.
 */
export async function updateProfile(
  profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
  }
): Promise<User> {
  try {
    const response = await apiClient.put<User>(
      '/api/Auth/me',
      profileData
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

/**
 * Change the password of the currently authenticated user.
 */
export async function changePassword(
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/Auth/change-password',
      passwordData
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export const authApi = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
};