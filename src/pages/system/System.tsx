
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Settings } from 'lucide-react';

const System = () => {
  return <PageTemplate 
    title="System" 
    icon={<Settings className="h-8 w-8" />}
    description="Manage system-wide settings and configurations."
  />;
};

export default System;
