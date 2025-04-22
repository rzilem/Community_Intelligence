
import { useState } from 'react';
import { useFormSubmission } from '@/hooks/form-builder/useFormSubmission';
import { FormTemplate } from '@/types/form-builder-types';
import { toast } from 'sonner';

export const useRequestForm = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitFormDialogOpen, setIsSubmitFormDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const { submitForm, isSubmitting } = useFormSubmission();

  const handleFormSelection = (formTemplate: FormTemplate) => {
    setSelectedForm(formTemplate);
    setIsCreateDialogOpen(false);
    setIsSubmitFormDialogOpen(true);
    
    // Initialize form data with empty values based on the form fields
    const initialData: Record<string, any> = {};
    formTemplate.fields.forEach((field: any) => {
      initialData[field.id] = field.defaultValue || '';
    });
    
    // Add title and description fields for homeowner request generation
    initialData.title = '';
    initialData.description = '';
    initialData.type = 'general';
    initialData.priority = 'medium';
    
    setFormData(initialData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFormSubmit = async () => {
    if (!selectedForm) {
      toast.error('No form selected');
      return false;
    }
    
    // Add validation here if needed
    // Make sure required fields are filled
    const requiredFields = selectedForm.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }
    
    const success = await submitForm(selectedForm, formData);
    if (success) {
      setIsSubmitFormDialogOpen(false);
      setSelectedForm(null);
      setFormData({});
      return true;
    }
    
    return false;
  };

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isSubmitFormDialogOpen,
    setIsSubmitFormDialogOpen,
    selectedForm,
    formData,
    handleFormSelection,
    handleFieldChange,
    handleFormSubmit,
    isSubmitting
  };
};
