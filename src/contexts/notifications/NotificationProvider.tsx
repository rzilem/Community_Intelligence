import React, { ReactNode, useMemo } from 'react';
import { NotificationContext } from './NotificationContext';

interface NotificationProviderProps {
  children: ReactNode;
}

// EMERGENCY FIX: Minimal NotificationProvider to stop infinite loops
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  console.log('🔧 NotificationProvider: Emergency minimal mode activated');
  
  // Provide minimal context without any hooks that could cause infinite loops
  const contextValue = useMemo(() => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {
      console.log('NotificationProvider: markAsRead called (disabled)');
    },
    markAllAsRead: () => {
      console.log('NotificationProvider: markAllAsRead called (disabled)');
    },
    deleteNotification: () => {
      console.log('NotificationProvider: deleteNotification called (disabled)');
    }
  }), []);
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};