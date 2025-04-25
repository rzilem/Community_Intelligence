
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const UserTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>User</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Role</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;
