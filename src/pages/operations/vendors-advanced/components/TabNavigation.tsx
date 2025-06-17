
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_CONFIG, VendorTab } from '../config/tab-constants';

interface TabNavigationProps {
  activeTab: VendorTab;
  onTabChange: (tab: VendorTab) => void;
  children: React.ReactNode;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as VendorTab)} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default TabNavigation;
