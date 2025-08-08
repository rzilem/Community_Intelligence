import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap } from 'lucide-react';
import AutomationDashboard from '@/components/accounting/AutomationDashboard';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';

const AutomationWorkflows: React.FC = () => {
const { currentAssociation } = useAuth();
  const associationId = currentAssociation?.id;

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

        {associationId ? (
          <AutomationDashboard associationId={associationId} />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Select an association to view automation workflows.
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AutomationWorkflows;