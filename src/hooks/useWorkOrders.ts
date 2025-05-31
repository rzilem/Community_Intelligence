
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkOrder {
  id: string;
  association_id: string;
  property_id?: string;
  resident_id?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderData {
  association_id: string;
  property_id?: string;
  resident_id?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  assigned_to?: string;
  estimated_cost?: number;
  due_date?: string;
}

export function useWorkOrders(associationId?: string) {
  return useQuery({
    queryKey: ['work-orders', associationId],
    queryFn: async () => {
      let query = supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (associationId) {
        query = query.eq('association_id', associationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }

      return data as WorkOrder[];
    },
    enabled: true,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrder: CreateWorkOrderData) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert(workOrder)
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work order created successfully');
    },
    onError: (error) => {
      console.error('Failed to create work order:', error);
      toast.error('Failed to create work order');
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkOrder> }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating work order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast.success('Work order updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update work order:', error);
      toast.error('Failed to update work order');
    },
  });
}
