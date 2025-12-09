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