
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { OnboardingTemplate, OnboardingStage } from '@/types/onboarding-types';
import TemplateCardHeader from './template-card/TemplateCardHeader';
import TemplateCardContent from './template-card/TemplateCardContent';

interface TemplateCardProps {
  template: OnboardingTemplate;
  stages: OnboardingStage[];
  isLoadingStages: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  stages, 
  isLoadingStages, 
  onEdit, 
  onDelete,
  onViewDetails 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/lead-management/onboarding/templates/${template.id}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <TemplateCardHeader 
          template={template} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </CardHeader>
      <CardContent>
        <TemplateCardContent 
          template={template} 
          stages={stages} 
          isLoadingStages={isLoadingStages} 
        />
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
