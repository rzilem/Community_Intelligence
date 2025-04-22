
import { createContext } from 'react';
import { NotificationItem } from '@/hooks/useNotifications';

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  // We'll define the hook implementation in each provider
  // This is just a stub to help with the typing
  const context = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
    deleteNotification: () => {},
    setNotifications: () => {}
  });
  
  return context;
};
