// src/hooks/useAIConfig.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AIConfig {
  model: string;
  max_tokens: number;
  temperature: number;
  enabled: boolean;
  api_key?: string;
}

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('secrets')
        .select('key, value')
        .in('key', [
          'openai_api_key',
          'ai_model',
          'ai_max_tokens',
          'ai_temperature',
          'ai_enabled'
        ]);

      if (error) throw error;

      // Convert array to object
      const configObj = data.reduce((acc: any, item: any) => {
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

    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch AI config:', err);
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
          .from('secrets')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      // Refresh config
      await fetchConfig();
      
      return { success: true };

    } catch (err) {
      setError(err.message);
      console.error('Failed to update AI config:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    refetch: fetchConfig
  };
}
