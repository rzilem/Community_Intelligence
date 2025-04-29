
import { createContext } from 'react';

export interface Notification {
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
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
  unreadCount: 0
});
