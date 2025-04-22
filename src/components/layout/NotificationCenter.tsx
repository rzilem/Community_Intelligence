
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotificationContext } from '@/contexts/notifications';
import { NotificationItem } from '@/hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead 
  } = useNotificationContext();
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    if (notification.link || notification.route) {
      navigate(notification.link || notification.route || '');
      setOpen(false);
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });
  
  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce<Record<string, NotificationItem[]>>(
    (groups, notification) => {
      const dateKey = new Date(notification.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
      return groups;
    },
    {}
  );
  
  // Sort date groups
  const sortedDateKeys = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex h-[350px]">
          <div className="w-1/4 border-r py-2 bg-gray-50">
            <div className="flex flex-col space-y-1 px-2">
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'all' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'invoice' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('invoice')}
              >
                Invoices
              </button>
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'lead' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('lead')}
              >
                Leads
              </button>
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'request' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('request')}
              >
                Requests
              </button>
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'event' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('event')}
              >
                Events
              </button>
              <button 
                className={cn(
                  "text-left text-xs py-1.5 px-2 rounded-md w-full",
                  activeTab === 'message' ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab('message')}
              >
                Messages
              </button>
            </div>
          </div>
          
          <div className="w-3/4">
            <ScrollArea className="h-[350px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                  <Bell className="h-10 w-10 mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sortedDateKeys.map(dateKey => (
                    <div key={dateKey} className="py-1">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500">
                        {new Date().toDateString() === dateKey ? 'Today' : dateKey}
                      </div>
                      {groupedNotifications[dateKey].map(notification => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start gap-2",
                            !notification.read_at && "bg-blue-50/40"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={cn(
                            "h-2 w-2 mt-1.5 rounded-full flex-shrink-0",
                            !notification.read_at ? "bg-blue-500" : "bg-gray-200"
                          )} />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {notification.content && (
                              <p className="text-xs text-gray-500">{notification.content}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(notification.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!notification.read_at && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
