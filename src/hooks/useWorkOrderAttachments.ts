
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

export function useWorkOrderAttachments(workOrderId: string) {
  return useQuery({
    queryKey: ['work-order-attachments', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_attachments')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrderAttachment[];
    },
    enabled: !!workOrderId,
  });
}

export function useAddWorkOrderAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workOrderId, file }: { workOrderId: string; file: File }) => {
      // Upload file to Supabase storage (when storage is set up)
      // For now, we'll create a mock URL
      const mockFilePath = `work-orders/${workOrderId}/${file.name}`;

      const { data, error } = await supabase
        .from('work_order_attachments')
        .insert({
          work_order_id: workOrderId,
          filename: file.name,
          file_path: mockFilePath,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('work_order_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
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
