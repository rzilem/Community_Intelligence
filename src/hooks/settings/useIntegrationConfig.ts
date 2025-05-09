
import { useState, useEffect } from 'react';
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
      console.log("Fetching OpenAI configuration...");
      const { data, error } = await supabase.functions.invoke('settings', {
        method: 'GET',
        body: { action: 'integrations' }
      });

      if (error) {
        console.error('Error fetching OpenAI config:', error);
        return;
      }

      console.log("Received integration settings:", data ? "Data present" : "No data");
      
      // Initialize with safe defaults if data is missing
      const openAIConfig = data?.integrationSettings?.OpenAI || {};
      
      setConfigFields({
        apiKey: openAIConfig.apiKey || '',
        configDate: openAIConfig.configDate || ''
      });
      
      setOpenAIModel(openAIConfig.model || 'gpt-4o-mini');
      
      // Check specifically if apiKey exists and is not empty
      const apiKeyExists = !!(openAIConfig.apiKey && openAIConfig.apiKey.trim() !== '');
      console.log("API Key exists:", apiKeyExists);
      setHasOpenAIKey(apiKeyExists);
    } catch (error) {
      console.error('Error in fetchOpenAIConfig:', error);
    }
  };

  const saveOpenAIConfig = async () => {
    setIsPending(true);
    try {
      // Check that we have a non-empty API key
      if (!configFields.apiKey || configFields.apiKey.trim() === '') {
        toast.error("OpenAI API key cannot be empty");
        setIsPending(false);
        return;
      }
      
      console.log("Saving OpenAI configuration with model:", openAIModel);
      
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
        console.error("Error saving OpenAI configuration:", error);
        toast.error(`Failed to save OpenAI configuration: ${error.message}`);
      } else {
        toast.success('OpenAI configuration saved successfully');
        setHasOpenAIKey(!!configFields.apiKey);
      }
    } catch (error: any) {
      console.error("Exception in saveOpenAIConfig:", error);
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
