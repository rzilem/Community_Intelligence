
import { createContext, useContext } from 'react';
import { NotificationItem } from '@/hooks/useNotifications';

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  setNotifications: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);
