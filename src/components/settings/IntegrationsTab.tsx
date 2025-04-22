
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { IntegrationSettings } from '@/types/settings-types';
import IntegrationCard from './integration/IntegrationCard';
import IntegrationConfigDialog from './integration/IntegrationConfigDialog';
import { getIntegrationsData, formatDate } from './integration/integrations-data';
import { Card, CardContent } from '@/components/ui/card';

const IntegrationsTab = () => {
  const { data: integrationSettings, isLoading } = useSystemSetting<IntegrationSettings>('integrations');
  const { mutate: updateIntegrationSettings, isPending } = useUpdateSystemSetting<IntegrationSettings>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configFields, setConfigFields] = useState<{[key: string]: string}>({});
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o-mini');

  const connectedIntegrations = integrationSettings?.integrationSettings || {};

  const handleConfigureIntegration = (name: string) => {
    setSelectedIntegration(name);
    const integrationConfig = connectedIntegrations[name] || {};
    setConfigFields({...integrationConfig});
    
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
    
    if (name === 'Stripe') {
      defaultFields = { apiKey: '', webhookSecret: '' };
    } else if (name === 'Google Maps') {
      defaultFields = { apiKey: '' };
    } else if (name === 'OpenAI') {
      defaultFields = { apiKey: '' };
    } else if (name === 'Plaid') {
      defaultFields = { clientId: '', secret: '' };
    }
    
    setConfigFields(defaultFields);
    setConfigDialogOpen(true);
  };

  const handleDisconnectIntegration = (name: string) => {
    const updatedSettings = { 
      ...integrationSettings || { integrationSettings: {} }
    };
    
    if (!updatedSettings.integrationSettings) {
      updatedSettings.integrationSettings = {};
    }
    
    if (updatedSettings.integrationSettings[name]) {
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
    setConfigFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      const updatedSettings = { 
        ...integrationSettings || { integrationSettings: {} }
      };
      
      if (!updatedSettings.integrationSettings) {
        updatedSettings.integrationSettings = {};
      }
      
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

  const integrationsData = getIntegrationsData().map(integration => ({
    ...integration,
    status: (connectedIntegrations[integration.name] ? 'connected' : 'available') as 'connected' | 'available' | 'coming-soon',
    configDate: connectedIntegrations[integration.name]?.configDate
  }));

  const integrations = [
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard 
            key={integration.name}
            name={integration.name}
            status={integration.status}
            description={integration.description}
            icon={integration.icon}
            onConfigure={() => handleConfigureIntegration(integration.name)}
            onDisconnect={() => handleDisconnectIntegration(integration.name)}
            onConnect={() => handleConnectIntegration(integration.name)}
            configDate={integration.configDate ? formatDate(integration.configDate) : undefined}
          />
        ))}
      </div>

      <IntegrationConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        selectedIntegration={selectedIntegration}
        configFields={configFields}
        onConfigFieldChange={handleConfigFieldChange}
        openAIModel={openAIModel}
        onOpenAIModelChange={setOpenAIModel}
        onSave={handleSaveConfig}
        hasOpenAIKey={!!connectedIntegrations[selectedIntegration as string]?.apiKey}
        isPending={isPending}
      />
    </div>
  );
};

export default IntegrationsTab;
