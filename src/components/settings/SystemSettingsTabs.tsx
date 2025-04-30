
import React from 'react';
import { Palette, Bell, Shield, Database, Puzzle } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemSettingsTabsProps {
  activeTab: string;
}

const SystemSettingsTabs: React.FC<SystemSettingsTabsProps> = ({ activeTab }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <TabsList className="grid grid-cols-5 w-full md:w-auto">
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" /> 
          <span className="hidden sm:inline">Appearance</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> 
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> 
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Database className="h-4 w-4" /> 
          <span className="hidden sm:inline">System</span>
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Puzzle className="h-4 w-4" /> 
          <span className="hidden sm:inline">Integrations</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default SystemSettingsTabs;
