// src/entities/book/model/types.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  price: number;
  isFree: boolean;
  pageCount: number;
  genres: Genre[];
  contentUrl?: string; // Added for the reader
  progress?: number; // Added for my-books page
  isFavorite?: boolean;
  isPurchased?: boolean;
  user?: {
    name: string;
  };
}

export interface Genre {
  id: string;
  name: string;
}

export interface BookFilters {
  genre?: string;
  search?: string;
  page?: number;
  limit?: number;
}