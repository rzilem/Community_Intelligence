
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileSettings from './UserProfileSettings';
import IntegrationsSettings from './IntegrationsSettings';
import LogViewer from './LogViewer';
import WebhookSettings from './WebhookSettings';
import WebhookTester from './WebhookTester';

const SettingsTabs = () => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="webhookTester">Webhook Tester</TabsTrigger>
        <TabsTrigger value="logs">System Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4 mt-4">
        <UserProfileSettings />
      </TabsContent>
      <TabsContent value="integrations" className="space-y-4 mt-4">
        <IntegrationsSettings />
      </TabsContent>
      <TabsContent value="webhooks" className="space-y-4 mt-4">
        <WebhookSettings />
      </TabsContent>
      <TabsContent value="webhookTester" className="space-y-4 mt-4">
        <WebhookTester />
      </TabsContent>
      <TabsContent value="logs" className="space-y-4 mt-4">
        <LogViewer />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
