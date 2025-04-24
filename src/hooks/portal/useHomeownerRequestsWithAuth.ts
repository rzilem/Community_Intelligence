
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType, RequestAttachment } from '@/types/homeowner-request-types';

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
        // Explicitly cast the data to ensure type safety
        const typedRequests: HomeownerRequest[] = (data || []).map(item => {
          // Safe access to attachments - if it doesn't exist in the data, use empty array
          const attachmentData = item.attachments || [];
          
          return {
            id: item.id,
            title: item.title,
            description: item.description || '', // Ensure description is never undefined
            status: item.status as HomeownerRequestStatus,
            priority: item.priority as HomeownerRequestPriority,
            type: item.type as HomeownerRequestType,
            created_at: item.created_at,
            updated_at: item.updated_at,
            resident_id: item.resident_id,
            property_id: item.property_id,
            association_id: item.association_id,
            assigned_to: item.assigned_to,
            resolved_at: item.resolved_at,
            html_content: item.html_content,
            tracking_number: item.tracking_number,
            attachments: attachmentData as RequestAttachment[] // Cast with safety
          };
        });
        setRequests(typedRequests);
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
      
      // Ensure we provide all required fields with proper types
      const newRequest = {
        title: formData.title || '',
        description: formData.description || '', // Ensure description is always provided
        resident_id: currentUser.id,
        association_id: currentAssociation.id,
        status: 'open' as HomeownerRequestStatus,
        priority: formData.priority || 'medium' as HomeownerRequestPriority,
        type: formData.type || 'general' as HomeownerRequestType,
        tracking_number: trackingNumber,
        created_at: new Date().toISOString(),
        property_id: formData.property_id,
        html_content: formData.html_content,
        attachments: formData.attachments || [] // Ensure attachments is always provided
      };

      const { data, error } = await supabase
        .from('homeowner_requests')
        .insert(newRequest)
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
