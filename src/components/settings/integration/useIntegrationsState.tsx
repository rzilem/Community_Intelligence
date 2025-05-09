
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { IntegrationSettings } from '@/types/settings-types';
import { getIntegrationsData, formatDate } from './integrations-data';

export const useIntegrationsState = () => {
  const { data: integrationSettings, isLoading } = useSystemSetting<IntegrationSettings>('integrations');
  const { mutate: updateIntegrationSettings, isPending } = useUpdateSystemSetting<IntegrationSettings>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configFields, setConfigFields] = useState<{[key: string]: string}>({});
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o-mini');

  // Initialize connectedIntegrations with an empty object if it's undefined
  const connectedIntegrations = integrationSettings?.integrationSettings || {};
  
  // Debug: Log the integration settings at load time
  useEffect(() => {
    if (!isLoading) {
      console.log('Integration Settings:', integrationSettings);
    }
  }, [isLoading, integrationSettings]);

  const handleConfigureIntegration = (name: string) => {
    setSelectedIntegration(name);
    const integrationConfig = connectedIntegrations[name] || {};
    
    console.log(`Configuring ${name}, current config:`, integrationConfig);
    
    // Make a copy of the integration config to avoid mutation issues
    const configFieldsCopy = {...integrationConfig};
    setConfigFields(configFieldsCopy);
    
    if (name === 'OpenAI' && integrationConfig.model) {
      setOpenAIModel(integrationConfig.model);
    } else {
      setOpenAIModel('gpt-4o-mini');
    }
    
    setConfigDialogOpen(true);
  };

  const handleConnectIntegration = (name: string) => {
    setSelectedIntegration(name);
    let defaultFields: {[key: string]: string} = {};
    
    // Get the integration definition to determine required fields
    const integrationDef = getIntegrationsData().find(i => i.name === name);
    if (integrationDef) {
      // Initialize all fields from the definition
      integrationDef.configFields.forEach(field => {
        defaultFields[field] = '';
      });
    } else {
      // Fallback initialization for specific integrations
      if (name === 'Stripe') {
        defaultFields = { apiKey: '', webhookSecret: '' };
      } else if (name === 'Google Maps') {
        defaultFields = { apiKey: '' };
      } else if (name === 'OpenAI') {
        defaultFields = { apiKey: '' };
      } else if (name === 'Plaid') {
        defaultFields = { clientId: '', secret: '' };
      }
    }
    
    console.log(`Connecting ${name}, initialized fields:`, Object.keys(defaultFields));
    
    setConfigFields(defaultFields);
    setConfigDialogOpen(true);
  };

  const handleDisconnectIntegration = (name: string) => {
    const updatedSettings = { 
      integrationSettings: {
        ...connectedIntegrations
      }
    };
    
    if (updatedSettings.integrationSettings && updatedSettings.integrationSettings[name]) {
      delete updatedSettings.integrationSettings[name];
      
      updateIntegrationSettings(updatedSettings, {
        onSuccess: () => {
          toast.success(`${name} has been disconnected`);
        },
        onError: (error) => {
          toast.error(`Failed to disconnect ${name}: ${error.message}`);
        }
      });
    }
  };

  const handleConfigFieldChange = (field: string, value: string) => {
    console.log(`Updating field ${field} to: ${value ? '[value set]' : '[empty]'}`);
    setConfigFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      // Ensure we have a proper integrationSettings structure
      const updatedSettings = { 
        integrationSettings: {
          ...connectedIntegrations
        }
      };
      
      if (selectedIntegration === 'OpenAI') {
        updatedSettings.integrationSettings[selectedIntegration] = {
          ...configFields,
          model: openAIModel,
          configDate: new Date().toISOString()
        };
      } else {
        updatedSettings.integrationSettings[selectedIntegration] = {
          ...configFields,
          configDate: new Date().toISOString()
        };
      }
      
      console.log("Saving integration settings:", JSON.stringify({
        ...updatedSettings,
        integrationSettings: {
          ...updatedSettings.integrationSettings,
          OpenAI: updatedSettings.integrationSettings.OpenAI ? {
            ...updatedSettings.integrationSettings.OpenAI,
            apiKey: updatedSettings.integrationSettings.OpenAI.apiKey ? "[PRESENT]" : "[MISSING]"
          } : undefined
        }
      }));
      
      updateIntegrationSettings(updatedSettings, {
        onSuccess: () => {
          setConfigDialogOpen(false);
          toast.success(`${selectedIntegration} configuration saved`);
        },
        onError: (error) => {
          console.error("Save error:", error);
          toast.error(`Failed to save configuration: ${error.message || 'Unknown error'}`);
        }
      });
    }
  };

  // Transform the raw integration data into the format we need for rendering
  const getProcessedIntegrations = () => {
    const integrationsData = getIntegrationsData().map(integration => {
      // Check if the integration is connected by looking for an apiKey or any other required field
      const isConnected = connectedIntegrations[integration.name] && 
                         Object.keys(connectedIntegrations[integration.name]).some(key => 
                           key !== 'configDate' && key !== 'model' && 
                           connectedIntegrations[integration.name][key]);
      
      return {
        ...integration,
        status: isConnected ? 'connected' : 'available',
        configDate: connectedIntegrations[integration.name]?.configDate
      };
    }) as Array<{
      name: string;
      status: 'connected' | 'available' | 'coming-soon';
      description: string;
      icon: React.ReactNode;
      configDate?: string;
    }>;

    return [
      ...integrationsData.filter(i => i.name !== 'Eleven Labs' && i.name !== 'X.AI'),
      {
        ...integrationsData.find(i => i.name === 'Eleven Labs')!,
        status: 'coming-soon' as const
      },
      {
        ...integrationsData.find(i => i.name === 'X.AI')!,
        status: 'coming-soon' as const
      }
    ];
  };

  // Determine if we have a valid OpenAI API key for the selected integration
  const hasOpenAIKey = selectedIntegration === 'OpenAI' && 
                      !!configFields.apiKey && 
                      configFields.apiKey.trim() !== '';

  return {
    isLoading,
    isPending,
    selectedIntegration,
    configDialogOpen,
    setConfigDialogOpen,
    configFields,
    openAIModel,
    setOpenAIModel,
    handleConfigureIntegration,
    handleConnectIntegration,
    handleDisconnectIntegration,
    handleConfigFieldChange,
    handleSaveConfig,
    integrations: getProcessedIntegrations(),
    hasOpenAIKey: hasOpenAIKey
  };
};
