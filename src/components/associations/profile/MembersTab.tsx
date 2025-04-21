
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AssociationMember, MemberType } from '@/types/member-types';
import { toast } from 'sonner';
import { MemberForm } from '../members/MemberForm';
import { MemberList } from '../members/MemberList';
import { useSupabaseQuery } from '@/hooks/supabase';
import { ResidentWithProfile } from '@/types/resident-types';
import { associationMemberService } from '@/services/members/association-member-service';
import { externalMemberService } from '@/services/members/external-member-service';

interface MembersTabProps {
  associationId: string;
}

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

export const MembersTab: React.FC<MembersTabProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('board');
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roleType, setRoleType] = useState<'board' | 'committee'>('board');
  const [roleName, setRoleName] = useState('');
  const [editingMember, setEditingMember] = useState<AssociationMember | null>(null);
  const [memberType, setMemberType] = useState<MemberType>('homeowner');
  
  // Manual entry state
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  // Fetch homeowners
  const { data: associationHomeowners = [], isLoading: isLoadingHomeowners } = useSupabaseQuery<ResidentWithProfile[]>(
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

  // Filter homeowners based on search
  const filteredHomeowners = searchQuery
    ? associationHomeowners.filter(homeowner => {
        const query = searchQuery.toLowerCase();
        const firstName = homeowner.user?.profile?.first_name?.toLowerCase() || '';
        const lastName = homeowner.user?.profile?.last_name?.toLowerCase() || '';
        const email = homeowner.user?.profile?.email?.toLowerCase() || '';
        
        return firstName.includes(query) || 
               lastName.includes(query) || 
               email.includes(query) ||
               `${firstName} ${lastName}`.includes(query);
      })
    : associationHomeowners;

  useEffect(() => {
    if (associationId) {
      fetchMembers();
    }
  }, [associationId]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await associationMemberService.getAssociationMembers(associationId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load association members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setSelectedUserId('');
    setRoleType('board');
    setRoleName('');
    setMemberType('homeowner');
    setManualFirstName('');
    setManualLastName('');
    setManualEmail('');
    setSearchQuery('');
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: AssociationMember) => {
    setEditingMember(member);
    setSelectedUserId(member.user_id);
    setRoleType(member.role_type);
    setRoleName(member.role_name);
    setMemberType(member.member_type);
    setIsDialogOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setIsLoading(true);
      await associationMemberService.removeAssociationMember(memberId);
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (memberType === 'homeowner' && !selectedUserId) {
      toast.error('Please select a homeowner');
      return;
    }

    if ((memberType === 'developer' || memberType === 'builder') && 
        (!manualFirstName || !manualLastName || !manualEmail)) {
      toast.error('Please fill out all required fields');
      return;
    }

    if (!roleName) {
      toast.error('Please select a role');
      return;
    }

    try {
      setIsLoading(true);
      
      let userId = selectedUserId;
      
      if (memberType !== 'homeowner') {
        const existingUserData = await externalMemberService.findUserByEmail(manualEmail);
        
        if (existingUserData) {
          userId = existingUserData.id;
        } else {
          const newUserData = await externalMemberService.createExternalUser({
            first_name: manualFirstName,
            last_name: manualLastName,
            email: manualEmail,
            user_type: memberType
          }, associationId);
          
          if (newUserData) {
            userId = newUserData.id;
          } else {
            throw new Error('Failed to create user');
          }
        }
      }
      
      if (editingMember) {
        await associationMemberService.updateAssociationMember(editingMember.id, {
          role_type: roleType,
          role_name: roleName,
        });
      } else {
        await associationMemberService.addAssociationMember({
          user_id: userId,
          association_id: associationId,
          role_type: roleType,
          role_name: roleName,
          member_type: memberType
        });
      }

      fetchMembers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
    } finally {
      setIsLoading(false);
    }
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingMember 
                  ? `Edit ${editingMember.role_type === 'board' ? 'Board' : 'Committee'} Member` 
                  : `Add ${roleType === 'board' ? 'Board' : 'Committee'} Member`}
              </DialogTitle>
            </DialogHeader>
            
            <MemberForm
              memberType={memberType}
              setMemberType={setMemberType}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredHomeowners={filteredHomeowners}
              manualFirstName={manualFirstName}
              setManualFirstName={setManualFirstName}
              manualLastName={manualLastName}
              setManualLastName={setManualLastName}
              manualEmail={manualEmail}
              setManualEmail={setManualEmail}
              roleType={roleType}
              setRoleType={setRoleType}
              roleName={roleName}
              setRoleName={setRoleName}
              boardRoles={boardRoles}
              committeeRoles={committeeRoles}
              isLoading={isLoading}
              homeowners={associationHomeowners}
            />
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveMember} 
                disabled={
                  (memberType === 'homeowner' && !selectedUserId) || 
                  ((memberType === 'developer' || memberType === 'builder') && 
                    (!manualFirstName || !manualLastName || !manualEmail)) ||
                  !roleName || 
                  isLoading
                }
              >
                {isLoading 
                  ? 'Saving...' 
                  : editingMember 
                    ? 'Update' 
                    : 'Add Member'
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MembersTab;
