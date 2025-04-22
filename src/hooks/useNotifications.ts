
import { useContext } from 'react';
import { NotificationContext } from '@/contexts/notifications';

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  content?: string;
  type: 'maintenance' | 'payment' | 'document' | 'event' | 'message' | string;
  association_id?: string;
  created_at?: string;
  read_at?: string | null;
  metadata?: any;
  link?: string;
  
  // Additional properties needed by components
  read?: boolean;
  route?: string;
  description?: string;
  timestamp: string;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};
