
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';
import { Role } from '@/types/permission-types';

interface RoleOverviewTabProps {
  roles: Role[];
}

const RoleOverviewTab: React.FC<RoleOverviewTabProps> = ({ roles }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Access Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map(role => (
          <TableRow key={role.id}>
            <TableCell>
              <div className="font-medium">{role.name}</div>
            </TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <CheckCircle className={`h-4 w-4 mr-2 ${getAccessLevelColor(role.accessLevel)}`} />
                <span className="capitalize">{role.accessLevel}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const getAccessLevelColor = (level: string): string => {
  switch (level) {
    case 'unrestricted':
      return 'text-green-500';
    case 'high':
      return 'text-blue-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

export default RoleOverviewTab;
