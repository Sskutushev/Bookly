// frontend/src/features/auth/api/auth-api.ts

import { axiosInstance } from '@/shared/api/axios-instance';

// Get user profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/api/user/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData: { name?: string; email?: string; avatar?: string }) => {
  const response = await axiosInstance.patch('/api/user/profile', userData);
  return response.data;
};

// Update user email
export const updateUserEmail = async (email: string, password: string) => {
  const response = await axiosInstance.patch('/api/user/profile', {
    email,
    passwordForConfirmation: password // backend would validate current password
  });
  return response.data;
};

// Update user password
export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  const response = await axiosInstance.patch('/api/user/profile', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Update notification settings
export const updateNotificationSettings = async (settings: any) => {
  const response = await axiosInstance.patch('/api/user/notifications/settings', settings);
  return response.data;
};

// Login with email and password
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  return response.data;
};

// Register with email and password
export const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
  const response = await axiosInstance.post('/api/auth/register', { name, email, password });
  return response.data;
};

// Setup two-factor authentication
export const setupTwoFactor = async () => {
  const response = await axiosInstance.post('/api/auth/2fa/setup');
  return response.data;
};

// Verify two-factor setup
export const verifyTwoFactorSetup = async (token: string) => {
  const response = await axiosInstance.post('/api/auth/2fa/verify', { token });
  return response.data;
};

// Authenticate with two-factor
export const authenticateWithTwoFactor = async (userId: string, token: string) => {
  const response = await axiosInstance.post('/api/auth/2fa/authenticate', { userId, token });
  return response.data;
};

// Disable two-factor authentication
export const disableTwoFactor = async () => {
  const response = await axiosInstance.post('/api/auth/2fa/disable');
  return response.data;
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  const response = await axiosInstance.post('/api/auth/forgot-password', { email });
  return response.data;
};

// Reset password with token
export const resetPasswordWithToken = async (token: string, newPassword: string) => {
  const response = await axiosInstance.post(`/api/auth/reset-password/${token}`, { newPassword });
  return response.data;
};

// Reset password (alternative function name)
export const resetPassword = async (token: string, newPassword: string) => {
  return resetPasswordWithToken(token, newPassword);
};