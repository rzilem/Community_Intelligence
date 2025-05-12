
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const IntegrationsSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations Settings</CardTitle>
        <CardDescription>Manage external integrations and API connections</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This section will contain integration management features.
        </p>
      </CardContent>
    </Card>
  );
};

export default IntegrationsSettings;
