
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIntegrationConfig = () => {
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o-mini');
  const [configFields, setConfigFields] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchOpenAIConfig = async () => {
    try {
      console.log("Fetching OpenAI configuration...");
      setLastError(null);
      
      const { data, error } = await supabase.functions.invoke('settings', {
        method: 'GET',
        body: { action: 'integrations' }
      });

      if (error) {
        console.error('Error fetching OpenAI config:', error);
        setLastError(`Failed to fetch OpenAI configuration: ${error.message}`);
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
    } catch (error: any) {
      console.error('Error in fetchOpenAIConfig:', error);
      setLastError(`Error fetching configuration: ${error.message}`);
    }
  };

  const saveOpenAIConfig = async () => {
    setIsPending(true);
    setLastError(null);
    
    try {
      // Check that we have a non-empty API key
      if (!configFields.apiKey || configFields.apiKey.trim() === '') {
        toast.error("OpenAI API key cannot be empty");
        setIsPending(false);
        return;
      }
      
      console.log("Saving OpenAI configuration with model:", openAIModel);
      
      const { data, error } = await supabase.functions.invoke('settings', {
        method: 'PUT',
        body: { 
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
        setLastError(`Error from Supabase: ${error.message}`);
        toast.error(`Failed to save OpenAI configuration: ${error.message}`);
      } else if (data && !data.success) {
        console.error("API returned error response:", data);
        setLastError(`API error: ${data.error || 'Unknown error'}`);
        toast.error(`Failed to save configuration: ${data.error || 'Unknown error'}`);
      } else {
        console.log("OpenAI configuration saved successfully:", data);
        toast.success('OpenAI configuration saved successfully');
        setHasOpenAIKey(!!configFields.apiKey);
      }
    } catch (error: any) {
      console.error("Exception in saveOpenAIConfig:", error);
      setLastError(`Exception: ${error.message}`);
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
    hasOpenAIKey,
    lastError
  };
};
