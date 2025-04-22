
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // For this simple mock, we'll use a dummy user
          setUser({
            id: authUser.id,
            email: authUser.email || 'user@example.com',
            role: 'admin'
          });
        } else {
          // For demo purposes, set a mock user
          setUser({
            id: 'mock-user-id',
            email: 'demo@example.com',
            role: 'admin'
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // For demo purposes, set a mock user even if there's an error
        setUser({
          id: 'mock-user-id',
          email: 'demo@example.com',
          role: 'admin'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    isLoading
  };
}
