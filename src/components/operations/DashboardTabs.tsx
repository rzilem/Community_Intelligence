
import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className={cn("flex flex-wrap border-b", className)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              "py-3 px-6 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default DashboardTabs;
