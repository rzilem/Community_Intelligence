
import React from 'react';
import { useIntegrationsState } from './integration/useIntegrationsState';
import IntegrationsLoading from './integration/IntegrationsLoading';
import IntegrationsGrid from './integration/IntegrationsGrid';
import IntegrationConfigDialog from './integration/IntegrationConfigDialog';

const IntegrationsTab = () => {
  const {
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
    integrations,
    hasOpenAIKey
  } = useIntegrationsState();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <IntegrationsLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IntegrationsGrid 
        integrations={integrations}
        onConfigure={handleConfigureIntegration}
        onDisconnect={handleDisconnectIntegration}
        onConnect={handleConnectIntegration}
      />

      <IntegrationConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        selectedIntegration={selectedIntegration}
        configFields={configFields}
        onConfigFieldChange={handleConfigFieldChange}
        openAIModel={openAIModel}
        onOpenAIModelChange={setOpenAIModel}
        onSave={handleSaveConfig}
        hasOpenAIKey={hasOpenAIKey}
        isPending={isPending}
      />
    </div>
  );
};

export default IntegrationsTab;
