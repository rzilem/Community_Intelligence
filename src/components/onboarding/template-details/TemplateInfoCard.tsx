
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, FileCheck, 
} from 'lucide-react';
import { getTemplateIcon } from '../onboarding-utils';

interface TemplateInfoCardProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
}

const TemplateInfoCard: React.FC<TemplateInfoCardProps> = ({ template, stages }) => {
  const TemplateIcon = getTemplateIcon(template.template_type);
  
  // Calculate total estimated days
  const totalDays = stages.reduce((total, stage) => total + (stage.estimated_days || 0), 0) || 
                    template.estimated_days || 
                    0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-muted rounded-lg">
              <TemplateIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{template.name}</CardTitle>
              {template.description && (
                <p className="text-muted-foreground mt-1">{template.description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {template.template_type.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>Estimated days: {totalDays}</span>
          </div>
          <div className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            <span>Stages: {stages.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateInfoCard;
