
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';
import { IntegrationSettings } from '@/types/settings-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TestOpenAIButton from './TestOpenAIButton';
import OpenAIHelp from './OpenAIHelp';

interface IntegrationCardProps { 
  name: string; 
  status: 'connected' | 'available' | 'coming-soon'; 
  description: string;
  icon: React.ReactNode;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
  configDate?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  name, 
  status, 
  description, 
  icon,
  onConfigure,
  onDisconnect,
  onConnect,
  configDate
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-medium">{name}</h3>
          </div>
          <Badge variant={status === 'connected' ? 'default' : status === 'available' ? 'outline' : 'secondary'}>
            {status === 'connected' ? 'Connected' : status === 'available' ? 'Available' : 'Coming Soon'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        
        {status === 'connected' && configDate && (
          <p className="text-xs text-muted-foreground mt-1">Last configured: {configDate}</p>
        )}
        
        {status !== 'coming-soon' && (
          <div className="mt-4 flex justify-end space-x-2">
            {status === 'connected' && (
              <>
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  Configure
                </Button>
                <Button variant="ghost" size="sm" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
            {status === 'available' && (
              <Button variant="outline" size="sm" onClick={onConnect}>
                Connect
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const IntegrationsTab = () => {
  const { data: integrationSettings, isLoading } = useSystemSetting<IntegrationSettings>('integrations');
  const { mutate: updateIntegrationSettings } = useUpdateSystemSetting<IntegrationSettings>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configFields, setConfigFields] = useState<{[key: string]: string}>({});
  const [openAIModel, setOpenAIModel] = useState<string>('gpt-4o-mini');

  // Get connected integrations from settings
  const connectedIntegrations = integrationSettings?.integrationSettings || {};

  const handleConfigureIntegration = (name: string) => {
    setSelectedIntegration(name);
    const integrationConfig = connectedIntegrations[name] || {};
    setConfigFields({...integrationConfig});
    
    // Set OpenAI model if available
    if (name === 'OpenAI' && integrationConfig.model) {
      setOpenAIModel(integrationConfig.model);
    } else {
      setOpenAIModel('gpt-4o-mini');
    }
    
    setConfigDialogOpen(true);
  };

  const handleConnectIntegration = (name: string) => {
    setSelectedIntegration(name);
    // Set default config fields based on integration type
    let defaultFields: {[key: string]: string} = {};
    
    if (name === 'Stripe') {
      defaultFields = { apiKey: '', webhookSecret: '' };
    } else if (name === 'Google Maps') {
      defaultFields = { apiKey: '' };
    } else if (name === 'OpenAI') {
      defaultFields = { apiKey: '', model: 'gpt-4o-mini' };
    } else if (name === 'Plaid') {
      defaultFields = { clientId: '', secret: '' };
    }
    
    setConfigFields(defaultFields);
    setConfigDialogOpen(true);
  };

  const handleDisconnectIntegration = (name: string) => {
    // Create a copy of the current integration settings
    const updatedSettings = { ...integrationSettings };
    
    // Remove the integration
    if (updatedSettings.integrationSettings[name]) {
      delete updatedSettings.integrationSettings[name];
      
      // Update in the database
      updateIntegrationSettings(updatedSettings);
      toast.success(`${name} has been disconnected`);
    }
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      // Create a copy of the current integration settings
      const updatedSettings = { 
        ...integrationSettings,
        integrationSettings: {
          ...integrationSettings?.integrationSettings || {},
        }
      };
      
      // Add additional fields based on integration type
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
      
      console.log("Saving integration settings:", JSON.stringify(updatedSettings));
      
      // Update in the database
      updateIntegrationSettings(updatedSettings);
      setConfigDialogOpen(false);
      toast.success(`${selectedIntegration} configuration saved`);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const integrations = [
    {
      name: 'OpenAI',
      status: (connectedIntegrations['OpenAI'] ? 'connected' : 'available') as 'connected' | 'available' | 'coming-soon',
      description: 'Power AI capabilities throughout the platform with OpenAI integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      configFields: ['apiKey', 'model'],
      configDate: connectedIntegrations['OpenAI']?.configDate
    },
    {
      name: 'Stripe',
      status: (connectedIntegrations['Stripe'] ? 'connected' : 'available') as 'connected' | 'available' | 'coming-soon',
      description: 'Process payments for assessments and fees through Stripe',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      configFields: ['apiKey', 'webhookSecret'],
      configDate: connectedIntegrations['Stripe']?.configDate
    },
    {
      name: 'Google Maps',
      status: (connectedIntegrations['Google Maps'] ? 'connected' : 'available') as 'connected' | 'available' | 'coming-soon',
      description: 'Display and manage property locations with Google Maps integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      configFields: ['apiKey'],
      configDate: connectedIntegrations['Google Maps']?.configDate
    },
    {
      name: 'Plaid',
      status: (connectedIntegrations['Plaid'] ? 'connected' : 'available') as 'connected' | 'available' | 'coming-soon',
      description: 'Link and manage bank accounts securely with Plaid',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      configFields: ['clientId', 'secret'],
      configDate: connectedIntegrations['Plaid']?.configDate
    },
    {
      name: 'Eleven Labs',
      status: 'coming-soon' as const,
      description: 'Add voice features to enhance accessibility and user experience',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-pink-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
      configFields: []
    },
    {
      name: 'X.AI',
      status: 'coming-soon' as const,
      description: 'Implement advanced analytics capabilities with X.AI integration',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      configFields: []
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

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedIntegration} Configuration
              {selectedIntegration === 'OpenAI' && <OpenAIHelp />}
            </DialogTitle>
            <DialogDescription>
              Enter the required information to {connectedIntegrations[selectedIntegration as string] ? 'update' : 'connect'} {selectedIntegration}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {Object.keys(configFields).filter(field => field !== 'configDate' && field !== 'model').map((field) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </Label>
                <Input
                  id={field}
                  type={field.toLowerCase().includes('key') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                  value={configFields[field]}
                  onChange={(e) => setConfigFields({...configFields, [field]: e.target.value})}
                  className="col-span-3"
                />
              </div>
            ))}
            
            {/* Special field for OpenAI model selection */}
            {selectedIntegration === 'OpenAI' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Select 
                  value={openAIModel} 
                  onValueChange={setOpenAIModel}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {selectedIntegration === 'OpenAI' && connectedIntegrations['OpenAI']?.apiKey && (
              <TestOpenAIButton />
            )}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsTab;
