import { useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'lead' | 'invoice' | 'request' | 'event' | 'general' | 'message';
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  route?: string;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface PushNotificationHook {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => Promise<void>;
  isSubscribed: boolean;
}

export const useNotifications = (): PushNotificationHook => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = async (options: NotificationOptions): Promise<void> => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-icon.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction
      });
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    isSubscribed
  };
};