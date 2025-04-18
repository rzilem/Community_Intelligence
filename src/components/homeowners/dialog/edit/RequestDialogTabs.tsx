
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuickEditMenu from '../QuickEditMenu';

interface RequestDialogTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  assignedTo: string | null;
  associationId: string | null;
  propertyId: string | null;
  onAssignChange: (value: string) => void;
  onAssociationChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  children: React.ReactNode;
}

const RequestDialogTabs: React.FC<RequestDialogTabsProps> = ({
  activeTab,
  setActiveTab,
  assignedTo,
  associationId,
  propertyId,
  onAssignChange,
  onAssociationChange,
  onPropertyChange,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="email">Original Email</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>
        
        <QuickEditMenu 
          assignedTo={assignedTo}
          associationId={associationId}
          propertyId={propertyId}
          onAssignChange={onAssignChange}
          onAssociationChange={onAssociationChange}
          onPropertyChange={onPropertyChange}
        />
      </div>
      
      {children}
    </Tabs>
  );
};

export default RequestDialogTabs;
