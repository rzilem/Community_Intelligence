
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkOrderAttachment {
  id: string;
  work_order_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Mock data since work_order_attachments table doesn't exist yet
const mockAttachments: WorkOrderAttachment[] = [];

export function useWorkOrderAttachments(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-attachments', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      
      // Return mock data for now
      return mockAttachments.filter(attachment => attachment.work_order_id === workOrderId);
    },
    enabled: !!workOrderId,
  });
}

export function useAddWorkOrderAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workOrderId, file }: { workOrderId: string; file: File }) => {
      // Mock implementation for now
      const mockAttachment: WorkOrderAttachment = {
        id: Date.now().toString(),
        work_order_id: workOrderId,
        filename: file.name,
        file_path: `work-orders/${workOrderId}/${file.name}`,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockAttachments.push(mockAttachment);
      return mockAttachment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-attachments', data.work_order_id] });
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      console.error('Failed to upload attachment:', error);
      toast.error('Failed to upload file');
    },
  });
}

export function useDeleteWorkOrderAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      // Mock implementation for now
      const index = mockAttachments.findIndex(att => att.id === attachmentId);
      if (index > -1) {
        mockAttachments.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-attachments'] });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error);
      toast.error('Failed to delete file');
    },
  });
}
