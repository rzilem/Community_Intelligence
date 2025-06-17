
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { Pencil, Trash } from 'lucide-react';
import { AssociationMember } from '@/services/association-member-service';

interface MembersTableRowProps {
  member: AssociationMember;
  onEdit: (member: AssociationMember) => void;
  onDelete: (memberId: string) => void;
}

export const MembersTableRow: React.FC<MembersTableRowProps> = React.memo(({
  member,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow>
      <TableCell>{member.first_name} {member.last_name}</TableCell>
      <TableCell>{member.role_name}</TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive" 
            onClick={() => onDelete(member.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

MembersTableRow.displayName = 'MembersTableRow';
