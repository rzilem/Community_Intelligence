
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

// Mock data since work_order_history table doesn't exist yet
const mockHistory: WorkOrderHistoryEntry[] = [];

export function useWorkOrderHistory(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-history', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      // Return mock data for now
      return mockHistory.filter(entry => entry.work_order_id === workOrderId);
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
      // Mock implementation for now
      const newEntry: WorkOrderHistoryEntry = {
        id: Date.now().toString(),
        performed_by: 'current-user',
        performed_at: new Date().toISOString(),
        metadata: {},
        ...historyEntry,
      };
      
      mockHistory.push(newEntry);
      return newEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-history', data.work_order_id] });
    },
  });
}
