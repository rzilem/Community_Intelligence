
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import TemplateSearch from './TemplateSearch';
import TemplatesGrid from './TemplatesGrid';
import AITemplateGenerator from '../ai-templates/AITemplateGenerator';
import { showToast } from '@/utils/toast-helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const handleSaveTemplate = (template: { title: string; content: string; type: string }) => {
    // In a real implementation, you would save this to the database
    showToast.success("Template Created", `"${template.title}" has been saved as a ${template.type} template.`);
    
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Template Creator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create AI-Powered Template</DialogTitle>
                <DialogDescription>
                  Describe the template you need, and our AI will generate it for you.
                </DialogDescription>
              </DialogHeader>
              <AITemplateGenerator onSave={handleSaveTemplate} />
            </DialogContent>
          </Dialog>
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
