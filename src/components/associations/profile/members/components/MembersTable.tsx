
import React, { useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { AssociationMember } from '@/services/association-member-service';
import { MemberType } from '../utils/member-types';
import { MembersTableRow } from './MembersTableRow';
import { EmptyMembersState } from './EmptyMembersState';

interface MembersTableProps {
  members: AssociationMember[];
  memberType: MemberType;
  isLoading: boolean;
  onEdit: (member: AssociationMember) => void;
  onDelete: (memberId: string) => void;
  onAddMember: () => void;
}

export const MembersTable: React.FC<MembersTableProps> = React.memo(({
  members,
  memberType,
  isLoading,
  onEdit,
  onDelete,
  onAddMember
}) => {
  const filteredMembers = useMemo(() => 
    members.filter(member => member.role_type === memberType),
    [members, memberType]
  );

  const columnTitle = memberType === 'board' ? 'Position' : 'Committee';

  if (isLoading) {
    return <div className="text-center py-8">Loading {memberType} members...</div>;
  }

  if (filteredMembers.length === 0) {
    return (
      <EmptyMembersState 
        memberType={memberType} 
        onAddMember={onAddMember} 
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>{columnTitle}</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMembers.map(member => (
          <MembersTableRow
            key={member.id}
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
});

MembersTable.displayName = 'MembersTable';
