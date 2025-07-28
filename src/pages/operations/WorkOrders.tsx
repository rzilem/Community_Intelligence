import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Wrench } from 'lucide-react';

const WorkOrders: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Work Orders"
        icon={<Wrench className="h-8 w-8" />}
        description="Manage and track work orders for maintenance and operations"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Work Orders</h3>
            <p className="text-muted-foreground">
              Create, assign, and track work orders for maintenance and repair operations across your properties.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default WorkOrders;