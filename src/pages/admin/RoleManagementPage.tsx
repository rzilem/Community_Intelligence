
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { ShieldAlert } from 'lucide-react';

const RoleManagementPage: React.FC = () => {
  return (
    <PageTemplate
      title="Role Management"
      icon={<ShieldAlert className="h-8 w-8" />}
      description="Manage roles and permissions"
    >
      <div className="space-y-6">
        <p>Role management functionality coming soon...</p>
      </div>
    </PageTemplate>
  );
};

export default RoleManagementPage;
