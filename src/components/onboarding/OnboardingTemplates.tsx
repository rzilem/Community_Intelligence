import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import TooltipButton from '@/components/ui/tooltip-button';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { OnboardingTemplate } from '@/types/onboarding-types';
import TemplateCard from './TemplateCard';
import TemplateDialog from './TemplateDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { templateTypeOptions } from './onboarding-utils';

interface TemplateFormData {
  name: string;
  description: string;
  template_type: OnboardingTemplate['template_type'];
}

const OnboardingTemplates = () => {
  const navigate = useNavigate();
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate,
    deleteTemplate,
    getTemplateStages,
    refreshTemplates
  } = useOnboardingTemplates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({ 
    name: '', 
    description: '',
    template_type: 'hoa'
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [templateStages, setTemplateStages] = useState<Record<string, any>>({});
  const [loadingStages, setLoadingStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("OnboardingTemplates component loaded. Templates:", templates);
    
    if (templates.length === 0 && !isLoading) {
      console.log("No templates found, refreshing...");
      refreshTemplates();
    }
    
    templates.forEach(template => {
      if (!templateStages[template.id]) {
        loadStagesForTemplate(template.id);
      }
    });
  }, [templates, isLoading]);

  const loadStagesForTemplate = async (templateId: string) => {
    setLoadingStages(prev => ({ ...prev, [templateId]: true }));
    try {
      const stages = await getTemplateStages(templateId);
      setTemplateStages(prev => ({ ...prev, [templateId]: stages }));
    } catch (error) {
      console.error('Error loading stages for template:', error);
    } finally {
      setLoadingStages(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      template_type: value as OnboardingTemplate['template_type'] 
    }));
  };

  const handleCreateTemplate = async () => {
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      await createTemplate({
        name: formData.name,
        description: formData.description || undefined,
        template_type: formData.template_type,
        estimated_days: 30 // Default estimated days
      });
      setFormData({ name: '', description: '', template_type: 'hoa' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      await updateTemplate({
        id: selectedTemplate.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          template_type: formData.template_type
        }
      });
      setFormData({ name: '', description: '', template_type: 'hoa' });
      setSelectedTemplate(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setSelectedTemplate(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    setFormData({ name: '', description: '', template_type: 'hoa' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: OnboardingTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      template_type: template.template_type
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (template: OnboardingTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (templateId: string) => {
    console.log("View details for template:", templateId);
    navigate(`/lead-management/onboarding/templates/${templateId}`);
  };

  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : templates.filter(t => t.template_type === activeTab);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading templates...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground bg-muted p-2 rounded mb-4">
        Available templates: {templates.length}
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Onboarding Templates</h2>
        <TooltipButton 
          tooltip="Create a new template for onboarding clients"
          className="flex items-center gap-2"
          onClick={openCreateDialog}
        >
          <PlusCircle className="h-4 w-4" />
          New Template
        </TooltipButton>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {templateTypeOptions.map(option => (
            <TabsTrigger key={option.value} value={option.value} className="flex items-center gap-1">
              {option.icon} {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground text-center">
              No templates found. Create your first onboarding template to get started.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={openCreateDialog}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              stages={templateStages[template.id] || []}
              isLoadingStages={loadingStages[template.id] || false}
              onEdit={() => openEditDialog(template)}
              onDelete={() => openDeleteDialog(template)}
              onViewDetails={() => handleViewDetails(template.id)}
            />
          ))}
        </div>
      )}

      <TemplateDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onTemplateTypeChange={handleTemplateTypeChange}
        onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isEditing={!!selectedTemplate}
      />

      <DeleteConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteTemplate}
        itemName={selectedTemplate?.name || ''}
        itemType="template"
      />
    </div>
  );
};

export default OnboardingTemplates;
