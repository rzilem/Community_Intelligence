
import React from 'react';
import IntegrationCard from './IntegrationCard';

interface IntegrationsGridProps {
  integrations: Array<{
    name: string;
    status: 'connected' | 'available' | 'coming-soon';
    description: string;
    icon: React.ReactNode;
    configDate?: string;
    waitlistUrl?: string;
    hideWhenComingSoon?: boolean;
  }>;
  onConfigure: (name: string) => void;
  onDisconnect: (name: string) => void;
  onConnect: (name: string) => void;
}

const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({
  integrations,
  onConfigure,
  onDisconnect,
  onConnect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {integrations
        .filter(i => !(i.status === 'coming-soon' && i.hideWhenComingSoon))
        .map((integration) => (
        <IntegrationCard
          key={integration.name}
          name={integration.name}
          status={integration.status}
          description={integration.description}
          icon={integration.icon}
          onConfigure={() => onConfigure(integration.name)}
          onDisconnect={() => onDisconnect(integration.name)}
          onConnect={() => onConnect(integration.name)}
          configDate={integration.configDate ? formatDate(integration.configDate) : undefined}
          waitlistUrl={integration.waitlistUrl}
          hideWhenComingSoon={integration.hideWhenComingSoon}
        />
      ))}
    </div>
  );
};

export default IntegrationsGrid;

// Need to import formatDate for the component
import { formatDate } from './integrations-data';
