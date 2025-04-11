
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Association {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export const useAssociations = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssociations = async () => {
    try {
      setIsLoading(true);
      
      // Using the provided function to get user's associations
      const { data, error } = await supabase
        .rpc('get_user_associations');

      if (error) throw error;
      
      setAssociations(data || []);
    } catch (error: any) {
      console.error('Error fetching associations:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociations();
  }, []);

  return { associations, isLoading, error, fetchAssociations };
};
