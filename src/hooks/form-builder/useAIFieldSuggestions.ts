
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormField, FormType } from '@/types/form-builder-types';
import { toast } from 'sonner';

export const useAIFieldSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFields, setSuggestedFields] = useState<FormField[]>([]);

  const getSuggestedFields = async (formTitle: string, formType: FormType | null, description?: string) => {
    if (!formTitle) {
      toast.error('Please provide a form title to get suggestions');
      return [];
    }

    setIsLoading(true);
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

      const fields = data.fields || [];
      setSuggestedFields(fields);
      
      // Show success message
      toast.success(`Generated ${fields.length} field suggestions`);
      return fields;
    } catch (error) {
      console.error('Error getting AI field suggestions:', error);
      toast.error('Failed to get field suggestions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestedFields([]);
  };

  return {
    suggestedFields,
    getSuggestedFields,
    clearSuggestions,
    isLoading
  };
};
