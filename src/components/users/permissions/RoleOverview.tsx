
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { CheckCircle } from 'lucide-react';
import { Role } from '@/types/permission-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface RoleOverviewProps {
  roles: Role[];
  getRoleDescription: (role: Role) => string;
  searchQuery: string;
  selectedRoles: string[];
  onRoleSelectionChange: (roleId: string, selected: boolean) => void;
}

export const RoleOverview: React.FC<RoleOverviewProps> = ({ 
  roles, 
  getRoleDescription,
  searchQuery,
  selectedRoles,
  onRoleSelectionChange
}) => {
  // Filter roles based on search query
  const filteredRoles = searchQuery 
    ? roles.filter(role => 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roles;

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Access Level</TableHead>
            <TableHead className="text-center">Compare</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles.map(role => (
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
              <TableCell className="text-center">
                <Checkbox 
                  id={`compare-overview-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => onRoleSelectionChange(role.id, checked === true)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
