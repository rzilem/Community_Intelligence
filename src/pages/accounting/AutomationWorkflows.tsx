import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap } from 'lucide-react';
import AutomationDashboard from '@/components/accounting/AutomationDashboard';
import AppLayout from '@/components/layout/AppLayout';

const AutomationWorkflows: React.FC = () => {
  const associationId = 'demo-association-id'; // Replace with actual association ID

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8" />
              Automation Workflows
            </h1>
            <p className="text-muted-foreground">
              Manage automated financial processes and recurring transactions
            </p>
          </div>
        </div>

        <AutomationDashboard associationId={associationId} />
      </div>
    </AppLayout>
  );
};

export default AutomationWorkflows;