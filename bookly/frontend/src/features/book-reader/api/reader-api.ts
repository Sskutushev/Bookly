// src/features/book-reader/api/reader-api.ts

import { axiosInstance } from '../../../shared/api/axios-instance';
import { Book } from '../../../entities/book/model/types';

export const getMyBooks = async (): Promise<Book[]> => {
  const response = await axiosInstance.get('/api/my-books');
  return response.data;
};

export const getBookForReading = async (bookId: string): Promise<any> => {
  const response = await axiosInstance.get(`/api/my-books/${bookId}/read`);
  return response.data;
};

export const updateReadingProgress = async (
  bookId: string, 
  currentPage: number, 
  progress: number
): Promise<any> => {
  const response = await axiosInstance.post(`/api/my-books/${bookId}/progress`, {
    currentPage,
    progress,
  });
  return response.data;
};

export const getReadingProgress = async (bookId: string): Promise<any> => {
  const response = await axiosInstance.get(`/api/my-books/${bookId}/progress`);
  return response.data;
};