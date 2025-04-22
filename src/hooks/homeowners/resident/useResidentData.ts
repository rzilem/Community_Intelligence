
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Homeowner } from '@/components/homeowners/detail/types';
import { formatResidentAsHomeowner } from './residentUtils';

export function useResidentData(residentId: string) {
  const [resident, setResident] = useState<Homeowner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      if (!residentId) {
        setResident(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('residents')
        .select('*, property:property_id(*)')
        .eq('id', residentId)
        .single();

      if (error) {
        console.error('Error fetching resident:', error);
        setError('Failed to fetch resident');
      } else {
        // Format the resident data to match the Homeowner type
        const formattedResident = formatResidentAsHomeowner(data);
        setResident(formattedResident);
      }
    } catch (err) {
      console.error('Error fetching resident:', err);
      setError('Failed to fetch resident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentData();
  }, [residentId]);

  const updateResidentData = async (data: Partial<Homeowner>) => {
    try {
      const { error } = await supabase
        .from('residents')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          move_in_date: data.moveInDate,
          resident_type: data.type
        })
        .eq('id', residentId);

      if (error) throw error;
      
      // Refresh resident data
      await fetchResidentData();
      
      return true;
    } catch (err) {
      console.error('Error updating resident:', err);
      throw new Error('Failed to update resident');
    }
  };

  return {
    resident,
    loading,
    error,
    fetchResidentData,
    updateResidentData
  };
};
