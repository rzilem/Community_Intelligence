
import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { getTemplateIcon } from '../onboarding-utils';

interface TemplateCardHeaderProps {
  template: OnboardingTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCardHeader: React.FC<TemplateCardHeaderProps> = ({ template, onEdit, onDelete }) => {
  const TemplateIcon = getTemplateIcon(template.template_type);
  const isPopular = template.name.toLowerCase().includes('complete') || 
                    template.name.toLowerCase().includes('60-day');

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-muted rounded-lg">
          <TemplateIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">{template.name}</h3>
          {isPopular && (
            <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800 border-amber-200">
              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
              Popular
            </Badge>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            Edit Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            Delete Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TemplateCardHeader;
