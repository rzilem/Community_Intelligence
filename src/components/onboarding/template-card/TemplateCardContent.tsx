
import React from 'react';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  // Calculate total estimated days from stages or use template estimation
  const totalDays = stages.length > 0 
    ? stages.reduce((sum, stage) => sum + (stage.estimated_days || 0), 0) 
    : template.estimated_days || 30;
  
  return (
    <div className="space-y-4">
      {template.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{totalDays} days</span>
        </div>
        <Badge variant="outline" className="capitalize">
          {template.template_type.replace('-', ' ')}
        </Badge>
      </div>
      
      <div>
        <div className="text-sm font-medium mb-2">Stages</div>
        {isLoadingStages ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : stages.length > 0 ? (
          <ul className="text-sm space-y-1">
            {stages.slice(0, 3).map(stage => (
              <li key={stage.id} className="flex items-center">
                <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                <span className="truncate">{stage.name}</span>
              </li>
            ))}
            {stages.length > 3 && (
              <li className="text-xs text-muted-foreground italic pl-4">
                +{stages.length - 3} more stages
              </li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No stages defined yet
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplateCardContent;
