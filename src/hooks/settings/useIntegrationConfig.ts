
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIntegrationConfig = () => {
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o-mini');
  const [configFields, setConfigFields] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

  const fetchOpenAIConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('settings', {
        method: 'GET',
        body: { action: 'integrations' }
      });

      if (error) {
        console.error('Error fetching OpenAI config:', error);
        return;
      }

      if (data && data.integrationSettings && data.integrationSettings.OpenAI) {
        const openAIConfig = data.integrationSettings.OpenAI;
        setConfigFields({
          apiKey: openAIConfig.apiKey || '',
          configDate: openAIConfig.configDate || ''
        });
        setOpenAIModel(openAIConfig.model || 'gpt-4o-mini');
        setHasOpenAIKey(!!openAIConfig.apiKey);
      }
    } catch (error) {
      console.error('Error fetching OpenAI configuration:', error);
    }
  };

  const saveOpenAIConfig = async () => {
    setIsPending(true);
    try {
      const { error } = await supabase.functions.invoke('settings', {
        method: 'PUT',
        body: { 
          action: 'integrations',
          integrationSettings: {
            OpenAI: {
              apiKey: configFields.apiKey,
              model: openAIModel,
              configDate: new Date().toISOString()
            }
          }
        }
      });

      if (error) {
        toast.error(`Failed to save OpenAI configuration: ${error.message}`);
      } else {
        toast.success('OpenAI configuration saved successfully');
        setHasOpenAIKey(!!configFields.apiKey);
      }
    } catch (error: any) {
      toast.error(`Error saving OpenAI configuration: ${error.message}`);
    } finally {
      setIsPending(false);
    }
  };

  const handleConfigFieldChange = (field: string, value: string) => {
    setConfigFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    openAIModel,
    setOpenAIModel,
    configFields,
    handleConfigFieldChange,
    saveOpenAIConfig,
    fetchOpenAIConfig,
    isPending,
    hasOpenAIKey
  };
};
