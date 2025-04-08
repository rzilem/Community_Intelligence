
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Bell } from 'lucide-react';

const Announcements = () => {
  return <PageTemplate 
    title="Announcements" 
    icon={<Bell className="h-8 w-8" />}
    description="Create and publish announcements for community residents."
  />;
};

export default Announcements;
