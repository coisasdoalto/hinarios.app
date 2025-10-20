import { useUser } from './useUser';

export const ADMINS = ['pablo.dinella@gmail.com', 'raphaeldeoliveiracorrea@gmail.com'];

export function useAdmin() {
  const { isLoading, user } = useUser();

  if (isLoading) {
    return {
      isLoading: true,
      isAdmin: false,
    };
  }

  return {
    isLoading,
    isAdmin: Boolean(user?.email && ADMINS.includes(user.email)),
  };
}
