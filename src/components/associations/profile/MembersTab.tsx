
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useMembersData } from './members/hooks/useMembersData';
import { useMemberDialog } from './members/hooks/useMemberDialog';
import { MembersTable } from './members/components/MembersTable';
import { AddEditMemberDialog } from './members/components/AddEditMemberDialog';
import { MemberType } from './members/utils/member-types';

interface MembersTabProps {
  associationId: string;
}

const MembersTab: React.FC<MembersTabProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState<MemberType>('board');
  
  const {
    members,
    users,
    isLoading,
    addMember,
    updateMember,
    deleteMember
  } = useMembersData(associationId);

  const {
    dialogState,
    openAddDialog,
    openEditDialog,
    closeDialog,
    updateDialogField
  } = useMemberDialog();

  const handleAddMember = () => {
    openAddDialog(activeTab);
  };

  const handleSaveMember = async () => {
    const { selectedUserId, roleType, roleName, editingMember } = dialogState;
    
    if (!selectedUserId || !roleName) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
          role_type: roleType,
          role_name: roleName
        });
      } else {
        await addMember({
          user_id: selectedUserId,
          association_id: associationId,
          role_type: roleType,
          role_name: roleName
        });
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Association Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="board" value={activeTab} onValueChange={(value) => setActiveTab(value as MemberType)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="board">Board Members</TabsTrigger>
            <TabsTrigger value="committee">Committee Members</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddMember}>
              <Plus className="mr-2 h-4 w-4" /> Add {activeTab === 'board' ? 'Board' : 'Committee'} Member
            </Button>
          </div>
          
          <TabsContent value="board">
            <MembersTable
              members={members}
              memberType="board"
              isLoading={isLoading}
              onEdit={openEditDialog}
              onDelete={deleteMember}
              onAddMember={handleAddMember}
            />
          </TabsContent>
          
          <TabsContent value="committee">
            <MembersTable
              members={members}
              memberType="committee"
              isLoading={isLoading}
              onEdit={openEditDialog}
              onDelete={deleteMember}
              onAddMember={handleAddMember}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <AddEditMemberDialog
        dialogState={dialogState}
        users={users}
        isLoading={isLoading}
        onClose={closeDialog}
        onSave={handleSaveMember}
        onUpdateField={updateDialogField}
      />
    </Card>
  );
};

export default MembersTab;
