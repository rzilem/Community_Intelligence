
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { MemberType } from '../utils/member-types';

interface EmptyMembersStateProps {
  memberType: MemberType;
  onAddMember: () => void;
}

export const EmptyMembersState: React.FC<EmptyMembersStateProps> = ({
  memberType,
  onAddMember
}) => {
  const displayType = memberType === 'board' ? 'Board' : 'Committee';
  
  return (
    <div className="text-center py-12 space-y-4">
      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium">No {displayType} Members</h3>
      <p className="text-muted-foreground">
        There are no {displayType.toLowerCase()} members added for this association yet.
      </p>
      <Button onClick={onAddMember}>Add {displayType} Member</Button>
    </div>
  );
};
