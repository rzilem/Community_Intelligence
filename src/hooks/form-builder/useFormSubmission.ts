
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormTemplate } from '@/types/form-builder-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useWorkflowExecution } from './useWorkflowExecution';
import { FormWorkflow } from '@/types/form-workflow-types'; 

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, currentAssociation } = useAuth();
  const { executeWorkflow } = useWorkflowExecution();

  const submitForm = async (formTemplate: FormTemplate, formData: Record<string, any>): Promise<boolean> => {
    if (!currentUser?.id) {
      toast.error('You must be logged in to submit a form');
      return false;
    }

    if (!formTemplate || !formTemplate.id) {
      toast.error('Invalid form template');
      return false;
    }

    try {
      setIsSubmitting(true);

      // Generate tracking number
      const trackingNumber = generateTrackingNumber();

      // Submit form data
      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          form_template_id: formTemplate.id,
          user_id: currentUser.id,
          association_id: currentAssociation?.id,
          form_data: formData,
          tracking_number: trackingNumber,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Form submitted successfully');

      // If the form leads to a homeowner request, create it
      if (formTemplate.form_type === 'portal_request' && formData.title) {
        try {
          await supabase
            .from('homeowner_requests')
            .insert({
              title: formData.title,
              description: formData.description || '',
              type: formData.type || 'general',
              priority: formData.priority || 'medium',
              status: 'open',
              tracking_number: trackingNumber,
              resident_id: currentUser.id,
              association_id: currentAssociation?.id,
              property_id: formData.property_id
            });
        } catch (requestError) {
          console.error('Error creating homeowner request:', requestError);
          // Don't fail the whole process if request creation fails
        }
      }

      // Fetch and execute associated workflows
      try {
        // Custom SQL query to avoid the type error
        const { data: workflowsData, error: workflowError } = await supabase
          .rpc('get_form_workflows', { template_id: formTemplate.id });

        if (workflowError) throw workflowError;

        const workflows = workflowsData as unknown as FormWorkflow[];

        if (workflows && workflows.length > 0) {
          // Execute each workflow in parallel
          await Promise.all(workflows.map(workflow => 
            executeWorkflow(workflow, {
              formData: {
                ...formData,
                submissionId: data.id,
                trackingNumber
              },
              userId: currentUser.id,
              associationId: currentAssociation?.id
            })
          ));
        }
      } catch (workflowError) {
        console.error('Error executing workflows:', workflowError);
        // Continue even if workflow execution fails
      }

      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a tracking number format: FORM-YYYY-XXXXX
  const generateTrackingNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `FORM-${year}-${random}`;
  };

  return {
    submitForm,
    isSubmitting
  };
}
