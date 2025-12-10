// src/features/auth/api/auth-api.ts

import { axiosInstance } from '../../../shared/api/axios-instance';
import { UserProfile, Purchase, NotificationSettings } from '../model/types';

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get('/api/user/profile');
  return response.data;
};

export const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axiosInstance.patch('/api/user/profile', data);
  return response.data;
};

export const getUserPurchases = async (): Promise<Purchase[]> => {
  const response = await axiosInstance.get('/api/user/purchases');
  return response.data;
};

export const updateNotificationSettings = async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
  const response = await axiosInstance.patch('/api/user/notifications/settings', data);
  return response.data;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axiosInstance.post('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.avatarUrl;
};

// 2FA Functions
export const setupTwoFactor = async () => {
  const response = await axiosInstance.post('/api/auth/2fa/setup');
  return response.data;
};

export const verifyTwoFactor = async (token: string) => {
  const response = await axiosInstance.post('/api/auth/2fa/verify', { token });
  return response.data;
};

export const disableTwoFactor = async () => {
  const response = await axiosInstance.post('/api/auth/2fa/disable');
  return response.data;
};

// Password Reset Functions
export const requestPasswordReset = async (email: string) => {
  const response = await axiosInstance.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await axiosInstance.post(`/api/auth/reset-password/${token}`, { newPassword });
  return response.data;
};