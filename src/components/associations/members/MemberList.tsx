
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, AlertCircle } from 'lucide-react';
import { AssociationMember } from '@/types/member-types';

interface MemberListProps {
  members: AssociationMember[];
  isLoading: boolean;
  onEdit: (member: AssociationMember) => void;
  onDelete: (memberId: string) => void;
  emptyMessage: string;
  addButtonLabel: string;
  onAdd: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  isLoading,
  onEdit,
  onDelete,
  emptyMessage,
  addButtonLabel,
  onAdd
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Members</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <Button onClick={onAdd}>{addButtonLabel}</Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map(member => (
          <TableRow key={member.id}>
            <TableCell>{member.first_name} {member.last_name}</TableCell>
            <TableCell>{member.role_name}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(member.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
