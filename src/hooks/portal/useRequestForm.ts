
import { useState } from 'react';
import { FormTemplate } from '@/types/form-builder-types';
import { useFormSubmission } from '@/hooks/form-builder/useFormSubmission';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export function useRequestForm() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitFormDialogOpen, setIsSubmitFormDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { submitForm, isSubmitting } = useFormSubmission();
  const { currentUser, currentAssociation } = useAuth();
  
  const resetForm = () => {
    setFormData({});
    setSelectedForm(null);
  };

  const handleFormSelection = (form: FormTemplate) => {
    setSelectedForm(form);
    setIsCreateDialogOpen(false);
    setIsSubmitFormDialogOpen(true);
    
    // Initialize form with default values and user metadata
    const initialData: Record<string, any> = {};
    
    // Add default values from form fields
    form.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      }
    });
    
    // Add user and association context if available
    if (currentUser) {
      initialData.user_id = currentUser.id;
      
      if (currentUser.email) {
        initialData.email = currentUser.email;
      }
      
      // Try to get name from profile if available
      const userProfile = currentUser as any;
      if (userProfile.first_name) {
        initialData.first_name = userProfile.first_name;
        initialData.last_name = userProfile.last_name || '';
        initialData.name = `${userProfile.first_name} ${userProfile.last_name || ''}`.trim();
      }
    }
    
    if (currentAssociation) {
      initialData.association_id = currentAssociation.id;
      initialData.association_name = currentAssociation.name;
    }
    
    setFormData(initialData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFormSubmit = async (): Promise<boolean> => {
    if (!selectedForm) {
      toast.error('No form selected');
      return false;
    }

    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        // Add default fields for homeowner requests if this is a portal request
        ...(selectedForm.form_type === 'portal_request' && {
          title: formData.title || 'New Request',
          type: formData.type || 'general',
          priority: formData.priority || 'medium',
          description: formData.description || '',
        })
      };

      const success = await submitForm(selectedForm, formattedData);
      
      if (success) {
        toast.success('Form submitted successfully');
        setIsSubmitFormDialogOpen(false);
        resetForm();
        return true;
      } else {
        toast.error('Failed to submit form');
        return false;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred');
      return false;
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
    isSubmitting,
    resetForm
  };
}
