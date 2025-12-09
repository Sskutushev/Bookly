// src/entities/book/api/book-api.ts

import { axiosInstance } from '@/shared/api/axios-instance';
import { Book, Genre, BookFilters } from '../model/types';

export const getBooks = async (filters?: BookFilters): Promise<Book[]> => {
  const params = new URLSearchParams();
  
  if (filters?.genre) params.append('genre', filters.genre);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await axiosInstance.get(`/api/books?${params.toString()}`);
  return response.data.books || response.data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await axiosInstance.get(`/api/books/${id}`);
  return response.data;
};

export const getBookFragment = async (id: string): Promise<string> => {
  const response = await axiosInstance.get(`/api/books/${id}/fragment`);
  return response.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const response = await axiosInstance.get('/api/genres');
  return response.data;
};

export const addToFavorites = async (bookId: string): Promise<void> => {
  await axiosInstance.post(`/api/favorites/${bookId}`);
};

export const removeFromFavorites = async (bookId: string): Promise<void> => {
  await axiosInstance.delete(`/api/favorites/${bookId}`);
};