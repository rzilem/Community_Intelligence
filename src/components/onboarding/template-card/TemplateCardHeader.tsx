
import React from 'react';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { getTemplateIcon } from '../onboarding-utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Edit, Trash } from 'lucide-react';

interface TemplateCardHeaderProps {
  template: OnboardingTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCardHeader: React.FC<TemplateCardHeaderProps> = ({ 
  template, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        {getTemplateIcon(template.template_type)}
        <h3 className="text-lg font-semibold">{template.name}</h3>
      </div>
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit template</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete template</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TemplateCardHeader;
