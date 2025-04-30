
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormTemplate } from '@/types/form-builder-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentAssociation, user } = useAuth();

  const submitForm = async (formTemplate: FormTemplate, data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Create a homeowner request with the form data
      const { error } = await supabase
        .from('homeowner_requests')
        .insert({
          title: formTemplate.name,
          description: `Submission from ${formTemplate.name} form`,
          form_template_id: formTemplate.id,
          form_data: data,
          status: 'open',
          priority: 'medium',
          type: formTemplate.form_type || 'general',
          submitted_at: new Date().toISOString(),
          resident_id: user?.id,
          association_id: currentAssociation?.id,
          tracking_number: `REQ-${Math.floor(Math.random() * 10000)}`
        });

      if (error) throw error;
      
      toast.success('Form submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting
  };
}
