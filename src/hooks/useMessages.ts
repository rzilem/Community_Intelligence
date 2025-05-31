
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface MessageThread {
  id: string;
  association_id: string;
  subject: string;
  participants: string[];
  created_by: string;
  last_message_at: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments: any[];
  is_read_by: Record<string, boolean>;
  message_type: 'text' | 'system' | 'announcement';
  created_at: string;
  updated_at: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useMessageThreads(associationId: string) {
  return useQuery({
    queryKey: ['message-threads', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          messages!inner(created_at)
        `)
        .eq('association_id', associationId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as MessageThread[];
    },
    enabled: !!associationId,
  });
}

export function useMessages(threadId: string) {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name, email)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!threadId,
  });
}

export function useCreateMessageThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadData: {
      association_id: string;
      subject: string;
      participants: string[];
      initial_message?: string;
    }) => {
      const { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          association_id: threadData.association_id,
          subject: threadData.subject,
          participants: threadData.participants,
        })
        .select()
        .single();

      if (threadError) throw threadError;

      if (threadData.initial_message) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            thread_id: thread.id,
            content: threadData.initial_message,
          });

        if (messageError) throw messageError;
      }

      return thread;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      toast.success('Message thread created successfully');
    },
    onError: (error) => {
      console.error('Failed to create message thread:', error);
      toast.error('Failed to create message thread');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      thread_id: string;
      content: string;
      attachments?: any[];
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: messageData.thread_id,
          content: messageData.content,
          attachments: messageData.attachments || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Update thread's last_message_at
      await supabase
        .from('message_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', messageData.thread_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    },
  });
}
