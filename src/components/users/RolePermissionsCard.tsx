
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RolePermissionsTable from './RolePermissionsTable';

const RolePermissionsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>
          Overview of permissions granted to each user role in the system. 
          Search for specific features, compare roles side-by-side, or edit permissions directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RolePermissionsTable />
      </CardContent>
    </Card>
  );
};

export default RolePermissionsCard;
