
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MessageThread {
  id: string;
  title: string;
  subject: string; // Add subject property
  description?: string;
  association_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  last_message_at: string;
  unread_count?: number; // Add unread_count property
  is_archived?: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  created_at: string;
  updated_at: string;
  attachments?: any[];
  sender_profile?: { // Add sender_profile property
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

// Mock data for now since message_threads table doesn't exist yet
const mockThreads: MessageThread[] = [
  {
    id: '1',
    title: 'Maintenance Request Discussion',
    subject: 'Pool Maintenance Schedule', // Add subject
    description: 'Discussion about pool maintenance',
    association_id: 'demo-association-id',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    participants: ['user-1', 'user-2'],
    last_message_at: new Date().toISOString(),
    unread_count: 2, // Add unread count
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    thread_id: '1',
    sender_id: 'user-1',
    content: 'Hello, I wanted to discuss the pool maintenance schedule.',
    message_type: 'text',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender_profile: { // Add sender profile
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    }
  },
];

export function useMessageThreads(associationId?: string) {
  return useQuery({
    queryKey: ['message-threads', associationId],
    queryFn: async () => {
      if (!associationId) return [];
      
      // Return mock data for now
      return mockThreads.filter(thread => thread.association_id === associationId);
    },
    enabled: !!associationId,
  });
}

export function useMessages(threadId?: string) {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      
      // Return mock data for now
      return mockMessages.filter(message => message.thread_id === threadId);
    },
    enabled: !!threadId,
  });
}

export function useCreateMessageThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadData: {
      title: string;
      subject: string; // Update to include subject
      description?: string;
      association_id: string;
      participants: string[];
      initial_message?: string;
    }) => {
      // Mock implementation for now
      const newThread: MessageThread = {
        id: Date.now().toString(),
        ...threadData,
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      
      return newThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      toast.success('Thread created successfully');
    },
    onError: (error) => {
      console.error('Failed to create thread:', error);
      toast.error('Failed to create thread');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      thread_id: string;
      content: string;
      message_type?: 'text' | 'file' | 'system';
    }) => {
      // Mock implementation for now
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_type: 'text',
        sender_profile: {
          first_name: 'Current',
          last_name: 'User',
          email: 'current.user@example.com'
        },
        ...messageData,
      };
      
      return newMessage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      toast.success('Message sent');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    },
  });
}
