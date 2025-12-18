// frontend/src/features/user/api/user-api.ts

import { axiosInstance } from '@/shared/api/axios-instance';

// Upload avatar
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axiosInstance.post('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get user purchases
export const getUserPurchases = async () => {
  const response = await axiosInstance.get('/api/user/purchases');
  return response.data;
};