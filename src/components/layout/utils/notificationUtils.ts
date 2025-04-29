
import { Notification } from '@/contexts/notifications';

export const getNotificationCount = (
  itemPath: string, 
  notifications: Notification[]
): number => {
  const section = itemPath.replace('/', '');
  
  if (section === 'lead-management') {
    return notifications.filter(n => n.type === 'lead' && !n.read).length;
  } else if (section === 'accounting') {
    return notifications.filter(n => n.type === 'invoice' && !n.read).length;
  } else if (section === 'community-management') {
    return notifications.filter(n => n.type === 'request' && !n.read).length;
  } else if (section === 'resale-management') {
    return notifications.filter(n => n.type === 'event' && !n.read).length;
  } else if (section === 'communications') {
    return notifications.filter(n => n.type === 'message' && !n.read).length;
  }
  return 0;
};
