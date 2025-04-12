
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { templateTypeOptions } from '../onboarding-utils';

interface TemplatesFilterProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TemplatesFilter = ({ 
  activeTab, 
  onTabChange 
}: TemplatesFilterProps) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="all">All Templates</TabsTrigger>
        {templateTypeOptions.map(option => (
          <TabsTrigger 
            key={option.value} 
            value={option.value} 
            className="flex items-center gap-1"
          >
            {option.icon} {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TemplatesFilter;
