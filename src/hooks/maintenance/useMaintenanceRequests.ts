
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MaintenanceRequest } from '@/types/maintenance-types';

interface UseMaintenanceRequestsParams {
  associationId?: string;
  propertyId?: string;
  status?: 'open' | 'in_progress' | 'closed' | string;
  enabled?: boolean;
}

export function useMaintenanceRequests({
  associationId,
  propertyId,
  status,
  enabled = true
}: UseMaintenanceRequestsParams = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Build filters based on inputs
  const filters = [];
  
  if (associationId) {
    filters.push({ column: 'association_id', value: associationId });
  }
  
  if (propertyId) {
    filters.push({ column: 'property_id', value: propertyId });
  }
  
  if (status) {
    filters.push({ column: 'status', value: status });
  }

  const { 
    data: requests, 
    isLoading, 
    refetch 
  } = useSupabaseQuery<MaintenanceRequest[]>(
    'maintenance_requests',
    {
      select: '*, property:property_id(*)',
      filter: filters,
      order: { column: 'created_at', ascending: false }
    },
    enabled
  );

  const createRequest = async (data: Partial<MaintenanceRequest>) => {
    setIsSubmitting(true);
    try {
      const { data: newRequest, error } = await supabase
        .from('maintenance_requests')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Maintenance request created successfully');
      refetch();
      return newRequest;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast.error('Failed to create maintenance request');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRequest = async (id: string, data: Partial<MaintenanceRequest>) => {
    setIsSubmitting(true);
    try {
      const { data: updatedRequest, error } = await supabase
        .from('maintenance_requests')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Maintenance request updated successfully');
      refetch();
      return updatedRequest;
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast.error('Failed to update maintenance request');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Maintenance request deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      toast.error('Failed to delete maintenance request');
      return false;
    }
  };

  return {
    requests: requests || [],
    isLoading,
    isSubmitting,
    createRequest,
    updateRequest,
    deleteRequest,
    refetchRequests: refetch
  };
}
