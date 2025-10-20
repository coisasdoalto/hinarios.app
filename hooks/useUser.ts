import { User, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';

import { auth } from '../firebase/web';

export function useUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const posthog = usePostHog();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsLoading(false);

      if (!authUser) return posthog.reset();

      posthog.identify(authUser.uid, {
        email: authUser.email,
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      if (!user || !authUser) return;

      // refresh when user changed to ease testing
      if (user.email !== authUser.email) {
        router.refresh();
      }
    });
  }, [user]);

  return {
    user,
    isLoading,
  };
}
