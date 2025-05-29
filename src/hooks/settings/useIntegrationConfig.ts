
// Community Intelligence - Integration Configuration Hook
// File: src/hooks/settings/useIntegrationConfig.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AIConfig {
  model: string;
  max_tokens: number;
  temperature: number;
  enabled: boolean;
  api_key?: string;
}

export function useIntegrationConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from system_settings table
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'openai_api_key',
          'ai_model',
          'ai_max_tokens',
          'ai_temperature',
          'ai_enabled'
        ]);

      if (error) {
        console.log('No system settings found, using defaults');
      }

      // Convert array to object
      const configObj = (data || []).reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      setConfig({
        model: configObj.ai_model || 'gpt-4',
        max_tokens: parseInt(configObj.ai_max_tokens) || 1000,
        temperature: parseFloat(configObj.ai_temperature) || 0.7,
        enabled: configObj.ai_enabled === 'true',
        api_key: configObj.openai_api_key
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch integration config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<AIConfig>) => {
    try {
      const configUpdates = [];
      const timestamp = new Date().toISOString();

      if (updates.model) {
        configUpdates.push({
          key: 'ai_model',
          value: updates.model,
          updated_at: timestamp
        });
      }

      if (updates.max_tokens !== undefined) {
        configUpdates.push({
          key: 'ai_max_tokens',
          value: updates.max_tokens.toString(),
          updated_at: timestamp
        });
      }

      if (updates.temperature !== undefined) {
        configUpdates.push({
          key: 'ai_temperature',
          value: updates.temperature.toString(),
          updated_at: timestamp
        });
      }

      if (updates.enabled !== undefined) {
        configUpdates.push({
          key: 'ai_enabled',
          value: updates.enabled.toString(),
          updated_at: timestamp
        });
      }

      if (updates.api_key) {
        configUpdates.push({
          key: 'openai_api_key',
          value: updates.api_key,
          updated_at: timestamp
        });
      }

      // Update each config item
      for (const update of configUpdates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      // Refresh config
      await fetchConfig();
      
      return { success: true };

    } catch (err: any) {
      setError(err.message);
      console.error('Failed to update integration config:', err);
      return { success: false, error: err.message };
    }
  };

  const fetchIntegrations = async () => {
    // Mock data for integrations since table might not exist
    setIntegrations([
      {
        id: '1',
        name: 'OpenAI',
        type: 'ai',
        enabled: true,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  };

  useEffect(() => {
    fetchConfig();
    fetchIntegrations();
  }, []);

  return {
    config,
    integrations,
    loading,
    error,
    updateConfig,
    refetch: fetchConfig
  };
}

// Alias for backward compatibility
export { useIntegrationConfig as useAIConfig };
