
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceRequest } from '@/types/maintenance-types';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';

export function useMaintenanceRequests(associationId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: requests = [],
    isLoading,
    refetch
  } = useSupabaseQuery<MaintenanceRequest[]>({
    tableName: 'maintenance_requests',
    select: '*, properties:property_id(*)',
    filters: associationId ? [{ column: 'association_id', value: associationId }] : [],
    orderBy: { column: 'created_at', ascending: false }
  });

  const createRequest = async (request: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          title: request.title,
          description: request.description,
          priority: request.priority,
          status: request.status || 'open',
          property_id: request.property_id,
          assigned_to: request.assigned_to,
          association_id: request.association_id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Maintenance request created successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast.error('Failed to create maintenance request');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Maintenance request updated successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      toast.error('Failed to update maintenance request');
      return null;
    } finally {
      setIsUpdating(false);
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
    requests,
    isLoading,
    isSubmitting,
    isUpdating,
    createRequest,
    updateRequest,
    deleteRequest,
    refetchRequests: refetch
  };
}
