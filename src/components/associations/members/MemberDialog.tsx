
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MemberForm } from './MemberForm';
import { AssociationMember, MemberType } from '@/types/member-types';
import { toast } from 'sonner';
import { ResidentWithProfile } from '@/types/resident-types';

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: AssociationMember | null;
  onSave: (data: any) => Promise<boolean>;
  isLoading: boolean;
  roleType: 'board' | 'committee';
  setRoleType: (type: 'board' | 'committee') => void;
  homeowners: ResidentWithProfile[];
  boardRoles: string[];
  committeeRoles: string[];
}

export const MemberDialog: React.FC<MemberDialogProps> = ({
  isOpen,
  onClose,
  editingMember,
  onSave,
  isLoading,
  roleType,
  setRoleType,
  homeowners,
  boardRoles,
  committeeRoles,
}) => {
  const [memberType, setMemberType] = React.useState<MemberType>('homeowner');
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleName, setRoleName] = React.useState('');
  const [manualFirstName, setManualFirstName] = React.useState('');
  const [manualLastName, setManualLastName] = React.useState('');
  const [manualEmail, setManualEmail] = React.useState('');

  const filteredHomeowners = searchQuery
    ? homeowners.filter(homeowner => {
        const query = searchQuery.toLowerCase();
        const firstName = homeowner.user?.profile?.first_name?.toLowerCase() || '';
        const lastName = homeowner.user?.profile?.last_name?.toLowerCase() || '';
        const email = homeowner.user?.profile?.email?.toLowerCase() || '';
        
        return firstName.includes(query) || 
              lastName.includes(query) || 
              email.includes(query) ||
              `${firstName} ${lastName}`.includes(query);
      })
    : homeowners;

  const handleSave = async () => {
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

    const success = await onSave({
      selectedUserId,
      roleType,
      roleName,
      memberType,
      manualFirstName,
      manualLastName,
      manualEmail
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          homeowners={homeowners}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
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
  );
};
