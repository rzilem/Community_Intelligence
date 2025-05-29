
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResaleEvent {
  id: string;
  property_address: string;
  sale_date: string;
  sale_price: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export const useResaleCalendarEvents = () => {
  const [events, setEvents] = useState<ResaleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResaleEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fixed: Changed from process.env.NODE_ENV to import.meta.env.MODE
        const isDevelopment = import.meta.env.MODE === 'development';
        
        if (isDevelopment) {
          // Mock data for development
          setEvents([
            {
              id: '1',
              property_address: '123 Main St',
              sale_date: '2024-02-15',
              sale_price: 450000,
              status: 'pending'
            },
            {
              id: '2', 
              property_address: '456 Oak Ave',
              sale_date: '2024-02-28',
              sale_price: 520000,
              status: 'completed'
            }
          ]);
        } else {
          // Production: fetch from Supabase
          const { data, error } = await supabase
            .from('property_resales')
            .select('*')
            .order('sale_date', { ascending: true });
            
          if (error) throw error;
          setEvents(data || []);
        }
      } catch (err) {
        console.error('Error fetching resale events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch resale events');
      } finally {
        setLoading(false);
      }
    };

    fetchResaleEvents();
  }, []);

  return { events, loading, error };
};
