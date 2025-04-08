
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal } from 'lucide-react';

const SystemSettings = () => {
  return <PageTemplate 
    title="System Settings" 
    icon={<SlidersHorizontal className="h-8 w-8" />}
    description="Configure system-wide settings and preferences."
  />;
};

export default SystemSettings;
