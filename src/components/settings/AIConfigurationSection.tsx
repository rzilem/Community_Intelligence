
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useAIConfiguration } from './ai-configuration/useAIConfiguration';
import { AIConfigFormFields } from './ai-configuration/AIConfigFormFields';
import { AIConfigActions } from './ai-configuration/AIConfigActions';

export function AIConfigurationSection() {
  const {
    values,
    isLoading,
    isSaving,
    handleInputChange,
    saveConfiguration,
    loadConfiguration
  } = useAIConfiguration();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Processing Configuration
        </CardTitle>
        <CardDescription>
          Configure AI processing thresholds and limits. These values are stored securely in system settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIConfigFormFields 
          values={values} 
          onFieldChange={handleInputChange} 
        />
        
        <AIConfigActions
          onSave={saveConfiguration}
          onReload={loadConfiguration}
          isSaving={isSaving}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
