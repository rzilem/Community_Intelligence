import { useState, useEffect } from 'react';
import { fetchResidentById, updateResident } from '@/services/hoa/residents';
import { Resident } from '@/types/app-types';

export const useResidentData = (residentId: string) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResident = async () => {
    if (!residentId) return;
    try {
      setLoading(true);
      const data = await fetchResidentById(residentId);
      setResident(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching resident:', err);
      setError('Failed to load resident data');
    } finally {
      setLoading(false);
    }
  };

  const updateResidentData = async (data: Partial<Resident>) => {
    if (!residentId) return null;
    try {
      const updated = await updateResident(residentId, data);
      setResident(updated);
      return updated;
    } catch (err) {
      console.error('Error updating resident:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchResident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);

  return { resident, loading, error, updateResidentData };
};
