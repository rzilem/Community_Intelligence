
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormTemplate } from '@/types/form-builder-types';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, currentAssociation } = useAuth();

  const submitForm = async (formTemplate: FormTemplate, formData: Record<string, any>) => {
    if (!currentUser || !currentAssociation) {
      toast.error('You must be logged in to submit a form');
      return false;
    }

    setIsSubmitting(true);
    try {
      // Create a submission record with the form data and metadata
      const { data, error } = await supabase.from('form_submissions').insert({
        form_template_id: formTemplate.id,
        user_id: currentUser.id,
        association_id: currentAssociation.id,
        property_id: formData.property_id || null,
        form_data: formData,
        status: 'pending',
        tracking_number: `REQ-${Date.now().toString().substring(7)}`,
        submitted_at: new Date().toISOString()
      }).select();

      if (error) {
        console.error('Error submitting form:', error);
        toast.error('Error submitting form: ' + error.message);
        return false;
      }

      // Also create a homeowner request entry if the form type is appropriate
      if (formTemplate.form_type === 'portal_request') {
        const { error: requestError } = await supabase.from('homeowner_requests').insert({
          title: formData.title || `${formTemplate.name} Request`,
          description: formData.description || 'Submitted via portal form',
          status: 'open',
          priority: formData.priority || 'medium',
          type: formData.type || 'general',
          association_id: currentAssociation.id,
          resident_id: currentUser.id,
          property_id: formData.property_id || null,
          tracking_number: data?.[0]?.tracking_number || `REQ-${Date.now().toString().substring(7)}`
        });

        if (requestError) {
          console.error('Error creating homeowner request:', requestError);
          // Still return true as the submission was saved
        }
      }

      toast.success('Form submitted successfully');
      return true;
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting
  };
};
