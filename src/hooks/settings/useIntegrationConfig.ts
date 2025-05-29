
import { useState } from 'react';
import { AIConfig, IntegrationConfig } from '@/types/bid-request-types';

export const useIntegrationConfig = () => {
  const [openAIModel, setOpenAIModel] = useState('gpt-4o-mini');
  const [configFields, setConfigFields] = useState({});
  const [isPending, setIsPending] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [lastError, setLastError] = useState<string>('');

  const handleConfigFieldChange = (field: string, value: any) => {
    setConfigFields(prev => ({ ...prev, [field]: value }));
  };

  const saveOpenAIConfig = async () => {
    setIsPending(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasOpenAIKey(true);
    } catch (error) {
      setLastError('Failed to save OpenAI config');
    } finally {
      setIsPending(false);
    }
  };

  const fetchOpenAIConfig = async () => {
    try {
      // Mock fetch operation
      setHasOpenAIKey(true);
    } catch (error) {
      setLastError('Failed to fetch OpenAI config');
    }
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
    lastError,
    // Legacy properties for compatibility
    config: { 
      model: openAIModel, 
      max_tokens: 2000, 
      temperature: 0.7, 
      enabled: hasOpenAIKey 
    } as AIConfig,
    integrations: [] as IntegrationConfig[],
    loading: isPending,
    error: lastError,
    updateConfig: async (updates: Partial<AIConfig>) => {},
    refetch: fetchOpenAIConfig
  };
};
