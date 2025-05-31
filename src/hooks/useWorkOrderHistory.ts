
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkOrderHistoryEntry {
  id: string;
  work_order_id: string;
  action: string;
  description: string;
  performed_by: string;
  performed_at: string;
  metadata: Record<string, any>;
}

export function useWorkOrderHistory(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-history', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_history')
        .select(`
          *,
          performer:profiles!performed_by(first_name, last_name, email)
        `)
        .eq('work_order_id', workOrderId)
        .order('performed_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrderHistoryEntry[];
    },
    enabled: !!workOrderId,
  });
}

export function useAddWorkOrderHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (historyEntry: {
      work_order_id: string;
      action: string;
      description: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('work_order_history')
        .insert(historyEntry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-history', data.work_order_id] });
    },
  });
}
