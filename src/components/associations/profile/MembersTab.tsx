
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MemberList } from '../members/MemberList';
import { MemberDialog } from '../members/MemberDialog';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useMemberOperations } from '@/hooks/members/useMemberOperations';
import { ResidentWithProfile } from '@/types/resident-types';

const boardRoles = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Director',
  'Officer',
  'Member at Large'
];

const committeeRoles = [
  'Architectural Review',
  'Landscape',
  'Maintenance',
  'Social',
  'Welcome',
  'Security',
  'Budget & Finance',
  'Rules & Regulations',
  'Communications',
  'Pool',
  'Nominating',
  'Chair',
  'Member'
];

interface MembersTabProps {
  associationId: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('board');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleType, setRoleType] = useState<'board' | 'committee'>('board');

  const { 
    members,
    isLoading,
    editingMember,
    setEditingMember,
    fetchMembers,
    handleSaveMember,
    handleDeleteMember
  } = useMemberOperations(associationId);

  const { data: associationHomeowners = [] } = useSupabaseQuery<ResidentWithProfile[]>(
    'residents',
    {
      select: `
        *,
        user:user_id (
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        )
      `,
      filter: [
        { column: 'property_id', operator: 'eq', value: null },
        { column: 'resident_type', operator: 'eq', value: 'owner' }
      ]
    }
  );

  useEffect(() => {
    if (associationId) {
      fetchMembers();
    }
  }, [associationId]);

  const handleAddMember = () => {
    setEditingMember(null);
    setRoleType(activeTab as 'board' | 'committee');
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: AssociationMember) => {
    setEditingMember(member);
    setRoleType(member.role_type);
    setIsDialogOpen(true);
  };

  const filteredMembers = members.filter(member => member.role_type === activeTab);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Association Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="board">Board Members</TabsTrigger>
            <TabsTrigger value="committee">Committee Members</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddMember}>
              Add {activeTab === 'board' ? 'Board' : 'Committee'} Member
            </Button>
          </div>

          <TabsContent value="board">
            <MemberList
              members={filteredMembers}
              isLoading={isLoading}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              emptyMessage="There are no board members added for this association yet."
              addButtonLabel="Add Board Member"
              onAdd={handleAddMember}
            />
          </TabsContent>
          
          <TabsContent value="committee">
            <MemberList
              members={filteredMembers}
              isLoading={isLoading}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              emptyMessage="There are no committee members added for this association yet."
              addButtonLabel="Add Committee Member"
              onAdd={handleAddMember}
            />
          </TabsContent>
        </Tabs>

        <MemberDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          editingMember={editingMember}
          onSave={handleSaveMember}
          isLoading={isLoading}
          roleType={roleType}
          setRoleType={setRoleType}
          homeowners={associationHomeowners}
          boardRoles={boardRoles}
          committeeRoles={committeeRoles}
        />
      </CardContent>
    </Card>
  );
};

export default MembersTab;
