
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import TemplateSearch from './TemplateSearch';
import TemplatesGrid from './TemplatesGrid';
import AITemplateCreator from '../ai-templates/AITemplateCreator';
import { useToast } from '@/hooks/use-toast';

interface TemplatesSectionProps {
  templates: any[];
  searchTemplates: string;
  onSearchChange: (value: string) => void;
  onUseTemplate: (id: string) => void;
  onTemplateAction: (action: string, id: string) => void;
}

const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  searchTemplates,
  onSearchChange,
  onUseTemplate,
  onTemplateAction
}) => {
  const { toast } = useToast();
  
  const handleSaveTemplate = (title: string, content: string, type: string) => {
    console.log('Saving template:', { title, content, type });
    // In a real implementation, you would save this to the database
    // For now, just show a toast notification
    toast({
      title: 'Template Created',
      description: `"${title}" has been saved as a ${type} template.`,
    });
    
    // Refresh template list or add to local state
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Message Templates</h2>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <TemplateSearch 
            searchValue={searchTemplates} 
            onSearchChange={onSearchChange}
          />
          
          <AITemplateCreator 
            onSaveTemplate={handleSaveTemplate}
          />
        </div>
      </div>
      
      <TemplatesGrid
        templates={templates}
        searchValue={searchTemplates}
        onUseTemplate={onUseTemplate}
        onTemplateAction={onTemplateAction}
      />
    </div>
  );
};

export default TemplatesSection;
