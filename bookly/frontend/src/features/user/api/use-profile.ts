// bookly/frontend/src/features/user/api/use-profile.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { useAuthStore } from '../../../entities/user/model/use-auth-store';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  telegram_id: string;
  // Add other profile fields as needed
}

const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/user/profile');
  return data;
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: isAuthenticated, // Only fetch profile if the user is authenticated
  });
};
