// bookly/frontend/src/features/book-reader/api/use-progress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api';

interface ProgressPayload {
    bookId: string;
    currentPage: number;
    progress: number;
}

const saveProgress = async (payload: ProgressPayload) => {
    return await api.post(`/progress/${payload.bookId}`, payload);
};

export const useProgressMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveProgress,
        onSuccess: (data, variables) => {
            // After successfully saving progress, we can update the cache 
            // for 'my-books' to reflect the new progress immediately.
            queryClient.invalidateQueries({ queryKey: ['my-books'] });
        },
    });
};
