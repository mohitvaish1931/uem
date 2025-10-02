import { apiClient } from './api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/register', userData);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  async refreshToken(): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>('/auth/refresh');
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiClient.put<void>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },
};