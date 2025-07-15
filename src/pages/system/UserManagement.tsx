import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { Users } from 'lucide-react';

const UserManagement: React.FC = () => {
  return (
    <AppLayout>
      <PageTemplate
        title="User Management"
        icon={<Users className="h-8 w-8" />}
        description="Manage user accounts, roles, and access across the system"
      >
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-muted-foreground">
              This page is coming soon. You'll be able to manage user accounts, roles, and access controls here.
            </p>
          </div>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default UserManagement;