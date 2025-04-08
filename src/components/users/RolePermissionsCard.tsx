
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RolePermissionsTable from './RolePermissionsTable';

const RolePermissionsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>
          Overview of what each role can access in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RolePermissionsTable />
      </CardContent>
    </Card>
  );
};

export default RolePermissionsCard;
