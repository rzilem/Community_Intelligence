
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth/useAuth';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { notifications = [], unreadCount = 0, markAllAsRead, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  
  // Automatically mark as read when popover is closed
  useEffect(() => {
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [open, unreadCount, markAllAsRead]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const renderNotifications = (items: NotificationItem[] = []) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>No notifications</p>
        </div>
      );
    }

    return items.map((notification) => (
      <NotificationCard 
        key={notification.id} 
        notification={notification} 
        onMarkAsRead={handleMarkAsRead} 
      />
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-[5px] rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b h-9">
            <TabsTrigger value="all" className="text-xs rounded-none">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs rounded-none">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[300px]">
            <TabsContent value="all" className="m-0 divide-y">
              {renderNotifications(notifications)}
            </TabsContent>
            <TabsContent value="unread" className="m-0 divide-y">
              {renderNotifications(notifications.filter(n => !n.read_at))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => {
  const isUnread = !notification.read_at;
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center">💬</div>;
      case 'maintenance':
        return <div className="bg-orange-100 text-orange-600 h-8 w-8 rounded-full flex items-center justify-center">🔧</div>;
      case 'system':
        return <div className="bg-purple-100 text-purple-600 h-8 w-8 rounded-full flex items-center justify-center">⚙️</div>;
      case 'payment':
        return <div className="bg-green-100 text-green-600 h-8 w-8 rounded-full flex items-center justify-center">💰</div>;
      default:
        return <div className="bg-gray-100 text-gray-600 h-8 w-8 rounded-full flex items-center justify-center">📣</div>;
    }
  };
  
  return (
    <div 
      className={`p-3 flex gap-3 hover:bg-muted/50 ${isUnread ? 'bg-muted/20' : ''}`}
      onClick={() => isUnread && onMarkAsRead(notification.id)}
    >
      {getIconForType(notification.type)}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-none">{notification.title}</h4>
          {isUnread && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] shrink-0">New</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.content}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
      </div>
    </div>
  );
};
