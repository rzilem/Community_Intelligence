
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { UserPlus } from 'lucide-react';

const UserManagementPage: React.FC = () => {
  return (
    <PageTemplate
      title="User Management"
      icon={<UserPlus className="h-8 w-8" />}
      description="Manage users and their access"
    >
      <div className="space-y-6">
        <p>User management functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default UserManagementPage;
