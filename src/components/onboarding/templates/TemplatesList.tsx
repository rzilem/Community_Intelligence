
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { OnboardingTemplate } from '@/types/onboarding-types';
import TemplateCard from '../TemplateCard';
import { useNavigate } from 'react-router-dom';

interface TemplatesListProps {
  templates: OnboardingTemplate[];
  filteredTemplates: OnboardingTemplate[];
  templateStages: Record<string, any>;
  loadingStages: Record<string, boolean>;
  isLoading: boolean;
  onCreateClick: () => void;
  onEditTemplate: (template: OnboardingTemplate) => void;
  onDeleteTemplate: (template: OnboardingTemplate) => void;
}

const TemplatesList = ({ 
  templates,
  filteredTemplates,
  templateStages,
  loadingStages,
  isLoading,
  onCreateClick,
  onEditTemplate,
  onDeleteTemplate
}: TemplatesListProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (templateId: string) => {
    console.log("View details for template:", templateId);
    navigate(`/lead-management/onboarding/templates/${templateId}`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading templates...</span>
    </div>;
  }

  if (filteredTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground text-center">
            {templates.length === 0 ? 
              "No templates found. Create your first onboarding template to get started." : 
              "No templates match your current filter. Try another filter."}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onCreateClick}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map((template) => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          stages={templateStages[template.id] || []}
          isLoadingStages={loadingStages[template.id] || false}
          onEdit={() => onEditTemplate(template)}
          onDelete={() => onDeleteTemplate(template)}
          onViewDetails={() => handleViewDetails(template.id)}
        />
      ))}
    </div>
  );
};

export default TemplatesList;
