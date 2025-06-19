
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface AIConfigValues {
  aiConfidenceThreshold: string;
  highConfidenceThreshold: string;
  processingTimeout: string;
  retryAttempts: string;
  maxFileSize: string;
  allowedFileTypes: string;
  openaiApiKey: string;
  openaiModel: string;
}

const defaultValues: AIConfigValues = {
  aiConfidenceThreshold: '0.6',
  highConfidenceThreshold: '0.8',
  processingTimeout: '300000',
  retryAttempts: '3',
  maxFileSize: '10485760',
  allowedFileTypes: 'image/jpeg,image/png,application/pdf',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini'
};

export function useAIConfiguration() {
  const [values, setValues] = useState<AIConfigValues>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Load AI processing configuration
      const { data: aiConfigData, error: aiConfigError } = await supabase.rpc('get_secret', {
        secret_name: 'ai_config'
      });

      // Load OpenAI configuration
      const { data: openaiConfigData, error: openaiConfigError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'integrations')
        .single();

      let configValues = { ...defaultValues };

      // Parse AI processing config
      if (!aiConfigError && aiConfigData) {
        const aiConfig = typeof aiConfigData === 'object' ? aiConfigData : JSON.parse(aiConfigData as string);
        configValues = {
          ...configValues,
          aiConfidenceThreshold: String(aiConfig.aiConfidenceThreshold || defaultValues.aiConfidenceThreshold),
          highConfidenceThreshold: String(aiConfig.highConfidenceThreshold || defaultValues.highConfidenceThreshold),
          processingTimeout: String(aiConfig.processingTimeout || defaultValues.processingTimeout),
          retryAttempts: String(aiConfig.retryAttempts || defaultValues.retryAttempts),
          maxFileSize: String(aiConfig.maxFileSize || defaultValues.maxFileSize),
          allowedFileTypes: String(aiConfig.allowedFileTypes || defaultValues.allowedFileTypes)
        };
      }

      // Parse OpenAI config
      if (!openaiConfigError && openaiConfigData?.value?.integrationSettings?.OpenAI) {
        const openaiConfig = openaiConfigData.value.integrationSettings.OpenAI;
        configValues = {
          ...configValues,
          openaiApiKey: openaiConfig.apiKey || '',
          openaiModel: openaiConfig.model || 'gpt-4o-mini'
        };
      }

      setValues(configValues);
      toast.success('Configuration loaded successfully');
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AIConfigValues, value: string) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateValues = (): boolean => {
    const aiThreshold = parseFloat(values.aiConfidenceThreshold);
    const highThreshold = parseFloat(values.highConfidenceThreshold);
    const timeout = parseInt(values.processingTimeout);
    const retries = parseInt(values.retryAttempts);
    const fileSize = parseInt(values.maxFileSize);

    if (isNaN(aiThreshold) || aiThreshold < 0 || aiThreshold > 1) {
      toast.error('AI Confidence Threshold must be between 0.0 and 1.0');
      return false;
    }

    if (isNaN(highThreshold) || highThreshold < 0 || highThreshold > 1) {
      toast.error('High Confidence Threshold must be between 0.0 and 1.0');
      return false;
    }

    if (highThreshold <= aiThreshold) {
      toast.error('High Confidence Threshold must be greater than AI Confidence Threshold');
      return false;
    }

    if (isNaN(timeout) || timeout <= 0) {
      toast.error('Processing Timeout must be a positive number');
      return false;
    }

    if (isNaN(retries) || retries < 0) {
      toast.error('Retry Attempts must be a non-negative number');
      return false;
    }

    if (isNaN(fileSize) || fileSize <= 0) {
      toast.error('Max File Size must be a positive number');
      return false;
    }

    if (!values.allowedFileTypes.trim()) {
      toast.error('Allowed File Types cannot be empty');
      return false;
    }

    return true;
  };

  const saveConfiguration = async () => {
    if (!validateValues()) {
      return;
    }

    setIsSaving(true);
    try {
      // Save AI processing configuration
      const aiConfigData = {
        aiConfidenceThreshold: values.aiConfidenceThreshold,
        highConfidenceThreshold: values.highConfidenceThreshold,
        processingTimeout: values.processingTimeout,
        retryAttempts: values.retryAttempts,
        maxFileSize: values.maxFileSize,
        allowedFileTypes: values.allowedFileTypes
      };

      const { error: aiConfigError } = await supabase.rpc('set_secret', {
        secret_name: 'ai_config',
        secret_value: JSON.stringify(aiConfigData)
      });

      if (aiConfigError) {
        throw new Error(`Failed to save AI configuration: ${aiConfigError.message}`);
      }

      // Save OpenAI configuration if API key is provided
      if (values.openaiApiKey.trim()) {
        const { error: openaiError } = await supabase.functions.invoke('update-openai-config', {
          body: {
            apiKey: values.openaiApiKey,
            model: values.openaiModel
          }
        });

        if (openaiError) {
          throw new Error(`Failed to save OpenAI configuration: ${openaiError.message}`);
        }
      }

      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save configuration: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  return {
    values,
    isLoading,
    isSaving,
    handleInputChange,
    saveConfiguration,
    loadConfiguration
  };
}
