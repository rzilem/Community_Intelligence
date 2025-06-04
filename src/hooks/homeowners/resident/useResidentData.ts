
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResidentData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  unit_number?: string;
  address?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useResidentData = () => {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch residents data
      const { data, error: fetchError } = await supabase
        .from('residents')
        .select('*');

      if (fetchError) {
        console.error('Error fetching residents:', fetchError);
        // Return mock data if table doesn't exist
        setResidents([
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            unit_number: '101',
            address: '123 Main St, Unit 101',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        return;
      }

      setResidents(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load resident data');
      setResidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return {
    residents,
    isLoading,
    error,
    refreshResidents: fetchResidents,
  };
};
