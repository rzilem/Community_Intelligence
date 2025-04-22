
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  phone_number?: string;
  role?: string;
}

export const useUser = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  return { user, profile, isLoading: isLoading || authLoading, error };
};
