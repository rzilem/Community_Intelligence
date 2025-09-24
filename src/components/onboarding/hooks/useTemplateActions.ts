
import { useState } from 'react';
import { toast } from 'sonner';
import { OnboardingTemplate } from '@/types/onboarding-types';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';

interface TemplateFormData {
  name: string;
  description: string;
  template_type: OnboardingTemplate['template_type'];
}

export const useTemplateActions = () => {
  const { 
    createTemplate, 
    updateTemplate,
    deleteTemplate,
  } = useOnboardingTemplates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({ 
    name: '', 
    description: '',
    template_type: 'hoa'
  });

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
      await updateTemplate(selectedTemplate.id, {
        name: formData.name,
        description: formData.description || undefined,
        template_type: formData.template_type
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

  return {
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedTemplate,
    formData,
    handleInputChange,
    handleTemplateTypeChange,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog
  };
};
