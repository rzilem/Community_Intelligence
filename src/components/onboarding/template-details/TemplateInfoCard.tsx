
import React from 'react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import { getTemplateIcon } from '../onboarding-utils';

interface TemplateInfoCardProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
}

const TemplateInfoCard = ({ template, stages }: TemplateInfoCardProps) => {
  const totalEstimatedDays = stages.reduce(
    (total, stage) => total + (stage.estimated_days || 0), 
    0
  ) || template.estimated_days || 30;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Details</CardTitle>
        <CardDescription>{template.description || 'No description provided'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Template Type</p>
            <div className="flex items-center">
              {getTemplateIcon(template.template_type)}
              <span className="ml-2">
                {template.template_type.charAt(0).toUpperCase() + template.template_type.slice(1)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Total Stages</p>
            <p>{stages.length}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Estimated Timeline</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{totalEstimatedDays} days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateInfoCard;
