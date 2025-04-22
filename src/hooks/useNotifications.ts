
import { useContext } from 'react';
import { NotificationContext } from '@/contexts/notifications';

export interface NotificationItem {
  id: string;
  title: string;
  type: 'maintenance' | 'payment' | 'document' | 'event' | 'message' | string;
  read: boolean;
  timestamp: string;
  description?: string;
  route?: string;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};
