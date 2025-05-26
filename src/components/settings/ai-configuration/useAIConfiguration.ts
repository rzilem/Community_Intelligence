
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AIConfigValues {
  aiConfidenceThreshold: string;
  highConfidenceThreshold: string;
  processingTimeout: string;
  retryAttempts: string;
  maxFileSize: string;
  allowedFileTypes: string;
}

const defaultValues: AIConfigValues = {
  aiConfidenceThreshold: '0.6',
  highConfidenceThreshold: '0.8',
  processingTimeout: '300000',
  retryAttempts: '3',
  maxFileSize: '10485760',
  allowedFileTypes: 'image/jpeg,image/png,application/pdf'
};

export function useAIConfiguration() {
  const [values, setValues] = useState<AIConfigValues>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_secret', {
        secret_name: 'ai_config'
      });

      if (error) {
        console.error('Error loading AI configuration:', error);
        toast.error('Failed to load AI configuration');
        return;
      }

      if (data) {
        const configData = typeof data === 'object' ? data : JSON.parse(data as string);
        
        setValues({
          aiConfidenceThreshold: String(configData.aiConfidenceThreshold || defaultValues.aiConfidenceThreshold),
          highConfidenceThreshold: String(configData.highConfidenceThreshold || defaultValues.highConfidenceThreshold),
          processingTimeout: String(configData.processingTimeout || defaultValues.processingTimeout),
          retryAttempts: String(configData.retryAttempts || defaultValues.retryAttempts),
          maxFileSize: String(configData.maxFileSize || defaultValues.maxFileSize),
          allowedFileTypes: String(configData.allowedFileTypes || defaultValues.allowedFileTypes)
        });
        
        toast.success('AI configuration loaded successfully');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load AI configuration');
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
      const configData = {
        aiConfidenceThreshold: values.aiConfidenceThreshold,
        highConfidenceThreshold: values.highConfidenceThreshold,
        processingTimeout: values.processingTimeout,
        retryAttempts: values.retryAttempts,
        maxFileSize: values.maxFileSize,
        allowedFileTypes: values.allowedFileTypes
      };

      const { error } = await supabase.rpc('set_secret', {
        secret_name: 'ai_config',
        secret_value: JSON.stringify(configData)
      });

      if (error) {
        console.error('Error saving AI configuration:', error);
        toast.error('Failed to save AI configuration');
        return;
      }

      toast.success('AI configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save AI configuration');
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
