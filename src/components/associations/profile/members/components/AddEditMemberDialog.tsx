
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberDialogState, User, MemberType } from '../utils/member-types';
import { BOARD_ROLES, COMMITTEE_ROLES } from '../utils/member-constants';

interface AddEditMemberDialogProps {
  dialogState: MemberDialogState;
  users: User[];
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateField: (field: keyof Omit<MemberDialogState, 'isOpen' | 'editingMember'>, value: any) => void;
}

export const AddEditMemberDialog: React.FC<AddEditMemberDialogProps> = ({
  dialogState,
  users,
  isLoading,
  onClose,
  onSave,
  onUpdateField
}) => {
  const { isOpen, editingMember, selectedUserId, roleType, roleName } = dialogState;
  
  const roleOptions = roleType === 'board' ? BOARD_ROLES : COMMITTEE_ROLES;
  const canSave = selectedUserId && roleName && !isLoading;

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
        
        <div className="space-y-4 py-4">
          {!editingMember && (
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUserId} onValueChange={(value) => onUpdateField('selectedUserId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Member Type</label>
            <Select value={roleType} onValueChange={(value: MemberType) => onUpdateField('roleType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select member type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board Member</SelectItem>
                <SelectItem value="committee">Committee Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {roleType === 'board' ? 'Board Position' : 'Committee'}
            </label>
            <Select value={roleName} onValueChange={(value) => onUpdateField('roleName', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${roleType === 'board' ? 'position' : 'committee'}`} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
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
