
import React from 'react';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import { Loader2 } from 'lucide-react';
import { templateTypeOptions } from '../onboarding-utils';

interface TemplateCardContentProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
  isLoadingStages: boolean;
}

const TemplateCardContent: React.FC<TemplateCardContentProps> = ({ 
  template, 
  stages, 
  isLoadingStages 
}) => {
  const totalStages = stages.length;
  const estimatedDays = stages.reduce(
    (total, stage) => total + (stage.estimated_days || 0), 
    0
  ) || template.estimated_days || 30;

  return (
    <>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {template.description || 'No description provided'}
      </p>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Template Type:</span>
          <span className="font-medium">
            {templateTypeOptions.find(t => t.value === template.template_type)?.label || 'Unknown'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Days:</span>
          <span className="font-medium">{estimatedDays} days</span>
        </div>
        {isLoadingStages ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stages:</span>
            <span className="font-medium">{totalStages} stages</span>
          </div>
        )}
      </div>
    </>
  );
};

export default TemplateCardContent;
