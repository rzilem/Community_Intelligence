
import { useState } from 'react';
import { FormTemplate } from '@/types/form-builder-types';
import { useFormSubmission } from '@/hooks/form-builder/useFormSubmission';

export function useRequestForm() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitFormDialogOpen, setIsSubmitFormDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submissionId, setSubmissionId] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  
  const { submitForm, isSubmitting } = useFormSubmission();

  const handleFormSelection = (form: FormTemplate) => {
    setSelectedForm(form);
    
    // Initialize form data with defaults
    const initialData: Record<string, any> = {};
    form.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      }
    });
    
    setFormData(initialData);
    setIsCreateDialogOpen(false);
    setIsSubmitFormDialogOpen(true);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFormSubmit = async () => {
    if (!selectedForm) return false;
    
    const success = await submitForm(selectedForm, formData);
    
    if (success) {
      // For demonstration purposes, set a fake submission ID
      // In a real application, this would come from the submitForm response
      setSubmissionStatus('submitted');
      setSubmissionId('form-submission-' + Date.now());
    }
    
    return success;
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
    isSubmitting,
    submissionStatus,
    submissionId
  };
}
