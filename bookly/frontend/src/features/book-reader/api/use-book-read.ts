// bookly/frontend/src/features/book-reader/api/use-book-read.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';

interface BookReadResponse {
    bookId: string;
    title: string;
    author: string;
    pdfUrl: string;
}

const fetchBookRead = async (bookId: string): Promise<BookReadResponse> => {
  const { data } = await api.get(`/books/${bookId}/read`);
  return data;
};

export const useBookRead = (bookId: string) => {
  return useQuery<BookReadResponse, Error>({
    queryKey: ['book-read', bookId],
    queryFn: () => fetchBookRead(bookId),
    enabled: !!bookId,
  });
};
