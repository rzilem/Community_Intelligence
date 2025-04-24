
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import TemplateCard from '../TemplateCard';
import CreateTemplateOptions from './CreateTemplateOptions';

interface TemplatesListProps {
  templates: OnboardingTemplate[];
  filteredTemplates: OnboardingTemplate[];
  templateStages: Record<string, OnboardingStage[]>;
  loadingStages: boolean;
  isLoading: boolean;
  onCreateClick: () => void;
  onEditTemplate: (template: OnboardingTemplate) => void;
  onDeleteTemplate: (template: OnboardingTemplate) => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({ 
  templates,
  filteredTemplates, 
  templateStages,
  loadingStages,
  isLoading,
  onCreateClick,
  onEditTemplate,
  onDeleteTemplate
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-2 text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium mb-2">No onboarding templates</h3>
        <p className="text-muted-foreground mb-4">
          Create your first template to start onboarding clients efficiently
        </p>
        <CreateTemplateOptions onCreateBasic={onCreateClick} />
      </div>
    );
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium mb-2">No templates match your filter</h3>
        <p className="text-muted-foreground mb-4">
          Try changing your filter or create a new template
        </p>
        <Button onClick={onCreateClick}>Create Template</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          stages={templateStages[template.id] || []}
          isLoadingStages={loadingStages}
          onEdit={() => onEditTemplate(template)}
          onDelete={() => onDeleteTemplate(template)}
        />
      ))}
    </div>
  );
};

export default TemplatesList;
