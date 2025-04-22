
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormTemplate } from '@/types/form-builder-types';
import { toast } from 'sonner';

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (formTemplate: FormTemplate, data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_template_id: formTemplate.id,
          data,
          submitted_at: new Date().toISOString(),
          status: 'pending'
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
