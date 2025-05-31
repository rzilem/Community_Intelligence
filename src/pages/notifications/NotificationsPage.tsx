
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Bell } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const NotificationsPage: React.FC = () => {
  return (
    <PageTemplate
      title="Automated Notifications"
      icon={<Bell className="h-8 w-8" />}
      description="AI-optimized multi-channel notification system"
    >
      <NotificationCenter />
    </PageTemplate>
  );
};

export default NotificationsPage;
