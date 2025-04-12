
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Edit, Trash, Loader2 } from 'lucide-react';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import { getTemplateIcon, templateTypeOptions } from './onboarding-utils';

interface TemplateCardProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
  isLoadingStages: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

const TemplateCard = ({ 
  template, 
  stages, 
  isLoadingStages, 
  onEdit, 
  onDelete,
  onViewDetails 
}: TemplateCardProps) => {
  const navigate = useNavigate();
  const totalStages = stages.length;
  const estimatedDays = stages.reduce(
    (total, stage) => total + (stage.estimated_days || 0), 
    0
  ) || template.estimated_days || 30;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/lead-management/onboarding/templates/${template.id}`);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getTemplateIcon(template.template_type)}
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete template</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={handleViewDetails}>
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
