
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal } from 'lucide-react';
import SystemSettingsContent from '@/components/settings/SystemSettingsContent';

const SystemSettings = () => {
  return (
    <PageTemplate 
      title="System Settings" 
      icon={<SlidersHorizontal className="h-8 w-8" />}
      description="Configure the system settings and preferences"
    >
      <div className="mt-6">
        <SystemSettingsContent />
      </div>
    </PageTemplate>
  );
};

export default SystemSettings;
