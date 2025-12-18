// frontend/src/features/favorites/api/favorites-api.ts

import { axiosInstance } from '../../../shared/api/axios-instance';
import { Book } from '../../../entities/book/model/types';

export const getFavorites = async (): Promise<Book[]> => {
  const response = await axiosInstance.get('/api/favorites');
  return response.data;
};