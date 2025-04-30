
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAITemplateGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTemplate = async (prompt: string, templateType: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the Edge Function to generate content
      const { data, error: generationError } = await supabase.functions.invoke('generate-communication-template', {
        body: { 
          prompt,
          templateType
        }
      });
      
      if (generationError) {
        throw new Error(generationError.message);
      }
      
      if (!data || !data.generatedText) {
        throw new Error('Failed to generate template content');
      }
      
      setGeneratedContent(data.generatedText);
      return data.generatedText;
    } catch (err: any) {
      console.error('Error generating template:', err);
      setError(err.message || 'Failed to generate template');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePersonalizedContent = async (
    templateContent: string, 
    recipientData: Record<string, any>
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the Edge Function to personalize content
      const { data, error: personalizationError } = await supabase.functions.invoke('personalize-communication', {
        body: { 
          templateContent,
          recipientData
        }
      });
      
      if (personalizationError) {
        throw new Error(personalizationError.message);
      }
      
      if (!data || !data.personalizedText) {
        throw new Error('Failed to personalize template content');
      }
      
      return data.personalizedText;
    } catch (err: any) {
      console.error('Error personalizing template:', err);
      setError(err.message || 'Failed to personalize template');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTemplate,
    generatePersonalizedContent,
    generatedContent,
    isGenerating,
    error,
    setGeneratedContent
  };
};
