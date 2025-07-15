import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar } from 'lucide-react';

const Events: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="Events"
        icon={<Calendar className="h-8 w-8" />}
        description="Manage community events and activities"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Events Management</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to manage community events and activities here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default Events;