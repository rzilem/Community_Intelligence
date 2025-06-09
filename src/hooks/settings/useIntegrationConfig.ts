
import { useState } from 'react';
import { AIConfig, IntegrationConfig } from '@/types/bid-request-types';

export function useIntegrationConfig() {
  const [config, setConfig] = useState<IntegrationConfig>({
    ai: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000
    },
    notifications: true,
    auto_processing: false
  });

  const [openAIModel, setOpenAIModel] = useState('gpt-4o-mini');
  const [configFields, setConfigFields] = useState({});
  const [isPending, setIsPending] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const updateConfig = (newConfig: Partial<IntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleConfigFieldChange = (field: string, value: any) => {
    setConfigFields(prev => ({ ...prev, [field]: value }));
  };

  const saveOpenAIConfig = async () => {
    setIsPending(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasOpenAIKey(true);
      setLastError(null);
    } catch (error) {
      setLastError('Failed to save OpenAI configuration');
    } finally {
      setIsPending(false);
    }
  };

  const fetchOpenAIConfig = async () => {
    try {
      // Mock fetch operation
      await new Promise(resolve => setTimeout(resolve, 500));
      setHasOpenAIKey(true);
    } catch (error) {
      setLastError('Failed to fetch OpenAI configuration');
    }
  };

  return {
    config,
    updateConfig,
    openAIModel,
    setOpenAIModel,
    configFields,
    handleConfigFieldChange,
    saveOpenAIConfig,
    fetchOpenAIConfig,
    isPending,
    hasOpenAIKey,
    lastError,
    loading: false,
    error: null
  };
}
