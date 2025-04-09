
import React from 'react';
import { cn } from '@/lib/utils';

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
    <div className={cn("flex flex-wrap border-b", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={cn(
            "py-3 px-6 text-sm font-medium transition-colors",
            activeTab === tab
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default DashboardTabs;
