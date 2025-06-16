
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { ALL_ROLES, UserRole } from '@/types/profile-types';

const RolePermissionsCard: React.FC = () => {
  const permissions = [
    { name: 'View Dashboard', admin: true, manager: true, resident: true, maintenance: true, accountant: true, treasurer: true, user: true },
    { name: 'Manage Users', admin: true, manager: false, resident: false, maintenance: false, accountant: false, treasurer: false, user: false },
    { name: 'Manage Associations', admin: true, manager: true, resident: false, maintenance: false, accountant: false, treasurer: false, user: false },
    { name: 'Manage Properties', admin: true, manager: true, resident: false, maintenance: false, accountant: false, treasurer: false, user: false },
    { name: 'View Financial Reports', admin: true, manager: true, resident: false, maintenance: false, accountant: true, treasurer: true, user: false },
    { name: 'Process Payments', admin: true, manager: false, resident: false, maintenance: false, accountant: true, treasurer: true, user: false },
    { name: 'Create Work Orders', admin: true, manager: true, resident: false, maintenance: true, accountant: false, treasurer: false, user: false },
    { name: 'View Documents', admin: true, manager: true, resident: true, maintenance: true, accountant: true, treasurer: true, user: false },
    { name: 'Send Communications', admin: true, manager: true, resident: false, maintenance: false, accountant: false, treasurer: false, user: false },
    { name: 'Manage System Settings', admin: true, manager: false, resident: false, maintenance: false, accountant: false, treasurer: false, user: false },
  ];
  const roles: UserRole[] = ALL_ROLES;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>
          Overview of permissions granted to each user role in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-56">Permission</TableHead>
              {roles.map(role => (
                <TableHead key={role} className="text-center capitalize">
                  {role}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                {roles.map(role => (
                  <TableCell key={role} className="text-center">
                    {permission[role as keyof typeof permission] ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RolePermissionsCard;
