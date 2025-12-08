// bookly/frontend/src/features/favorites/api/use-favorites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { Book } from '../../../entities/book/ui/BookCard/BookCard';

const fetchFavorites = async (): Promise<Book[]> => {
  const { data } = await api.get('/favorites');
  return data;
};

export const useFavorites = () => {
  return useQuery<Book[], Error>({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });
};

const addToFavorites = async (bookId: string) => {
    return await api.post(`/favorites/${bookId}`);
};

const removeFromFavorites = async (bookId: string) => {
    return await api.delete(`/favorites/${bookId}`);
};

export const useFavoriteMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bookId, isFavorite }: { bookId: string, isFavorite: boolean }) => 
            isFavorite ? removeFromFavorites(bookId) : addToFavorites(bookId),
        onSuccess: () => {
            // Invalidate and refetch favorites to update the list
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            // Optionally, invalidate single book queries to update their favorite status
            queryClient.invalidateQueries({ queryKey: ['book'] });
        },
    });
};
