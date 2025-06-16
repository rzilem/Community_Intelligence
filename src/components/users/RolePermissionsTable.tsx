
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';
import { ALL_ROLES, UserRole } from '@/types/profile-types';

const ROLE_INFO: Record<
  UserRole,
  { label: string; description: string; color: string; access: string }
> = {
  admin: {
    label: 'Administrator',
    description: 'Full access to all features, including system settings',
    color: 'text-green-500',
    access: 'Unrestricted'
  },
  manager: {
    label: 'Manager',
    description: 'Access to most features except system configuration',
    color: 'text-blue-500',
    access: 'High'
  },
  resident: {
    label: 'Resident',
    description: 'Access to community information and resident features',
    color: 'text-amber-500',
    access: 'Medium'
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Access to maintenance requests and schedules',
    color: 'text-amber-500',
    access: 'Medium'
  },
  accountant: {
    label: 'Accountant',
    description: 'Access to financial information and reports',
    color: 'text-amber-500',
    access: 'Medium'
  },
  treasurer: {
    label: 'Treasurer',
    description: 'Financial oversight and treasury management features',
    color: 'text-teal-500',
    access: 'High'
  },
  user: {
    label: 'Basic User',
    description: 'Limited access to basic features only',
    color: 'text-gray-500',
    access: 'Low'
  }
};

const RolePermissionsTable: React.FC = () => {
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
        {ALL_ROLES.map(role => (
          <TableRow key={role}>
            <TableCell>
              <div className="font-medium">{ROLE_INFO[role].label}</div>
            </TableCell>
            <TableCell>{ROLE_INFO[role].description}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <CheckCircle className={`h-4 w-4 ${ROLE_INFO[role].color} mr-2`} />
                <span>{ROLE_INFO[role].access}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RolePermissionsTable;
