
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultRoles } from '@/services/permission-service';
import RoleOverviewTab from './RolePermissionsTable/RoleOverviewTab';
import DetailedPermissionsTab from './RolePermissionsTable/DetailedPermissionsTab';

const RolePermissionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const roles = defaultRoles;

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Role Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <RoleOverviewTab roles={roles} />
      </TabsContent>
      
      <TabsContent value="detailed">
        <DetailedPermissionsTab roles={roles} />
      </TabsContent>
    </Tabs>
  );
};

export default RolePermissionsTable;
