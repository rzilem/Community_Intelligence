
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotifications, NotificationItem } from '@/hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { allNotifications, getTotalCount, markAllAsRead, markAsRead } = useNotifications();
  
  const totalCount = getTotalCount();
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id, notification.type);
    }
    
    if (notification.route) {
      navigate(notification.route);
      setOpen(false);
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = allNotifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });
  
  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce<Record<string, NotificationItem[]>>(
    (groups, notification) => {
      const dateKey = new Date(notification.timestamp).toDateString();
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
          {totalCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalCount > 99 ? '99+' : totalCount}
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
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="w-full justify-start px-4 pt-2 pb-0 overflow-x-auto">
            <TabsTrigger value="all" className="text-xs shrink-0">All</TabsTrigger>
            <TabsTrigger value="invoice" className="text-xs shrink-0">Invoices</TabsTrigger>
            <TabsTrigger value="lead" className="text-xs shrink-0">Leads</TabsTrigger>
            <TabsTrigger value="request" className="text-xs shrink-0">Requests</TabsTrigger>
            <TabsTrigger value="event" className="text-xs shrink-0">Events</TabsTrigger>
            <TabsTrigger value="message" className="text-xs shrink-0">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[350px]">
              {allNotifications.length === 0 ? (
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
                            !notification.read && "bg-blue-50/40"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={cn(
                            "h-2 w-2 mt-1.5 rounded-full flex-shrink-0",
                            !notification.read ? "bg-blue-500" : "bg-gray-200"
                          )} />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            {notification.description && (
                              <p className="text-xs text-gray-500">{notification.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id, notification.type);
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
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
