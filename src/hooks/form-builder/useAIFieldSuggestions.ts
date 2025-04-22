
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormField, FormType } from '@/types/form-builder-types';
import { toast } from 'sonner';

export const useAIFieldSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFields, setSuggestedFields] = useState<FormField[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getSuggestedFields = async (formTitle: string, formType: FormType | null, description?: string) => {
    if (!formTitle) {
      toast.error('Please provide a form title to get suggestions');
      setError('Form title is required');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Supabase Edge Function for AI suggestions
      const { data, error } = await supabase.functions.invoke('suggest-form-fields', {
        body: {
          title: formTitle,
          formType,
          description
        }
      });

      if (error) {
        throw error;
      }

      const fields = data?.fields || [];
      setSuggestedFields(fields);
      
      // Show success message
      if (fields.length > 0) {
        toast.success(`Generated ${fields.length} field suggestions`);
      } else {
        toast.info('No field suggestions generated. Try adding more context to your form title or description.');
      }
      
      return fields;
    } catch (error) {
      console.error('Error getting AI field suggestions:', error);
      const errorMessage = error.message || 'Failed to get field suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestedFields([]);
    setError(null);
  };

  return {
    suggestedFields,
    getSuggestedFields,
    clearSuggestions,
    isLoading,
    error
  };
};
