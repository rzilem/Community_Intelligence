
import { createContext } from 'react';
import { NotificationItem } from '@/hooks/useNotifications';

export interface Notification extends NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'invoice' | 'request' | 'event' | 'message' | string;
  read: boolean;
  timestamp: string;
  link?: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  deleteNotification?: (id: string) => void;
  setNotifications?: (notifications: Notification[]) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
  unreadCount: 0
});
