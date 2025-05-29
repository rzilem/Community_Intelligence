
import { useState, useEffect } from 'react';

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
        
        // Use mock data for now since property_resales table doesn't exist
        const mockEvents: ResaleEvent[] = [
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
        ];
        
        setEvents(mockEvents);
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
