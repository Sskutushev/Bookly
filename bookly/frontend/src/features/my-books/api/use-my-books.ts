// bookly/frontend/src/features/my-books/api/use-my-books.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { Book } from '../../../entities/book/ui/BookCard/BookCard';

interface MyBook extends Book {
    progress: number;
    status: 'reading' | 'finished' | 'purchased';
}

const fetchMyBooks = async (): Promise<MyBook[]> => {
  const { data } = await api.get('/my-books');
  return data;
};

export const useMyBooks = () => {
  return useQuery<MyBook[], Error>({
    queryKey: ['my-books'],
    queryFn: fetchMyBooks,
  });
};
