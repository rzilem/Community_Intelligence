
import React from 'react';
import { Bell, Mail, MessageCircle, AlertTriangle, MessageSquare, Newspaper } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettings } from '@/types/settings-types';
import NotificationItem from '@/components/settings/notifications/NotificationItem';

interface NotificationsTabProps {
  settings: NotificationSettings;
  onChange: (settings: Partial<NotificationSettings>) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ settings, onChange }) => {
  const notifications = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail className="h-5 w-5 text-primary" />,
      value: settings.emailNotifications
    },
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive in-app notifications',
      icon: <Bell className="h-5 w-5 text-primary" />,
      value: settings.pushNotifications
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Receive text messages for important alerts',
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
      value: settings.smsNotifications
    },
    {
      id: 'maintenanceAlerts',
      title: 'Maintenance Alerts',
      description: 'Get notified about scheduled maintenance',
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      value: settings.maintenanceAlerts
    },
    {
      id: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Get notified about security-related events',
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      value: settings.securityAlerts
    },
    {
      id: 'newsAndUpdates',
      title: 'News & Updates',
      description: 'Stay informed about new features and updates',
      icon: <Newspaper className="h-5 w-5 text-primary" />,
      value: settings.newsAndUpdates
    }
  ];

  const handleToggle = (id: keyof NotificationSettings, checked: boolean) => {
    onChange({ [id]: checked });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              description={notification.description}
              icon={notification.icon}
              checked={notification.value}
              onCheckedChange={(checked) => handleToggle(notification.id as keyof NotificationSettings, checked)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
