
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

  const updateConfig = (newConfig: Partial<IntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return {
    config,
    updateConfig,
    loading: false,
    error: null
  };
}
