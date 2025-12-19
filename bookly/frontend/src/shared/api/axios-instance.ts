// src/shared/api/axios-instance.ts

import axios from 'axios';
import { tg } from '../lib/telegram-app';

// LAST RESORT: Hardcoding the production URL to bypass Vercel environment variable issues.
const PROD_BACKEND_URL = 'https://bookly-p7vz.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:8080';

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? PROD_BACKEND_URL : LOCAL_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Telegram init data and auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Telegram init data to headers
    if (tg?.initData) {
      config.headers['X-Telegram-Init-Data'] = tg.initData;
    }
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no auth token, add guest ID if available
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        config.headers['x-guest-id'] = guestId;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 error and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.PROD ? PROD_BACKEND_URL : LOCAL_BACKEND_URL}/api/auth/refresh`,
            { refreshToken }
          );
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (tg) {
          tg.close();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;