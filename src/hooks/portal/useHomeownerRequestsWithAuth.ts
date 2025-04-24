
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';

export function useHomeownerRequestsWithAuth() {
  const [requests, setRequests] = useState<HomeownerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, currentAssociation } = useAuth();

  const fetchRequests = async () => {
    if (!currentUser?.id || !currentAssociation?.id) {
      setIsLoading(false);
      setError('User or association not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('homeowner_requests')
        .select('*')
        .eq('resident_id', currentUser.id)
        .eq('association_id', currentAssociation.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        setError(error.message);
        toast.error('Failed to load your requests');
      } else {
        setRequests(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching requests:', err);
      setError(err.message || 'Unknown error');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRequest = async (formData: Partial<HomeownerRequest>): Promise<boolean> => {
    if (!currentUser?.id || !currentAssociation?.id) {
      toast.error('You must be logged in to submit a request');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Generate a tracking number
      const year = new Date().getFullYear();
      const random = Math.floor(10000 + Math.random() * 90000);
      const trackingNumber = `REQ-${year}-${random}`;
      
      const { data, error } = await supabase
        .from('homeowner_requests')
        .insert({
          ...formData,
          resident_id: currentUser.id,
          association_id: currentAssociation.id,
          status: 'open',
          tracking_number: trackingNumber,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error submitting request:', error);
        toast.error('Failed to submit your request');
        return false;
      }

      toast.success('Request submitted successfully');
      await fetchRequests(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Unexpected error submitting request:', err);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (currentUser?.id && currentAssociation?.id) {
      fetchRequests();
    }
  }, [currentUser?.id, currentAssociation?.id]);

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    submitRequest
  };
}
