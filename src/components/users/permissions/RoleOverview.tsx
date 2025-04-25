
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { CheckCircle } from 'lucide-react';
import { Role } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoleOverviewProps {
  roles: Role[];
  getRoleDescription: (role: Role) => string;
}

export const RoleOverview: React.FC<RoleOverviewProps> = ({ roles, getRoleDescription }) => {
  return (
    <ScrollArea className="w-full">
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
                <HoverCard>
                  <HoverCardTrigger>
                    <div className="font-medium cursor-help">{role.name}</div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">{getRoleDescription(role)}</p>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle className={`h-4 w-4 mr-2 ${
                    role.accessLevel === 'unrestricted' ? 'text-green-500' :
                    role.accessLevel === 'high' ? 'text-blue-500' :
                    role.accessLevel === 'medium' ? 'text-amber-500' :
                    'text-gray-500'
                  }`} />
                  <span className="capitalize">{role.accessLevel}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
