
import React from 'react';
import { TableHead, TableRow, TableHeader } from '@/components/ui/table';

const UserTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>User</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Current Role</TableHead>
        <TableHead>Change Role</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;
