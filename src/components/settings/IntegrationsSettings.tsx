
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IntegrationsTab from './IntegrationsTab';
import WebhookSettings from './WebhookSettings';
import { Separator } from '@/components/ui/separator';

const IntegrationsSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Connect and manage third-party service integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationsTab />
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      <WebhookSettings />
    </div>
  );
};

export default IntegrationsSettings;
