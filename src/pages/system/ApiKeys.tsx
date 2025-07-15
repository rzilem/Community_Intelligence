import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Key } from 'lucide-react';

const ApiKeys: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="API Keys"
        icon={<Key className="h-8 w-8" />}
        description="Manage API keys and authentication tokens for system integrations"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Key className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Keys</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to manage API keys and authentication tokens for system integrations here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default ApiKeys;