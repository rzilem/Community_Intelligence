
import { useState } from 'react';
import { useFormSubmission } from '@/hooks/form-builder/useFormSubmission';
import { FormTemplate } from '@/types/form-builder-types';

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
    setFormData(initialData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFormSubmit = async () => {
    if (!selectedForm) return;
    
    const success = await submitForm(selectedForm, formData);
    if (success) {
      setIsSubmitFormDialogOpen(false);
      setSelectedForm(null);
      setFormData({});
    }
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
