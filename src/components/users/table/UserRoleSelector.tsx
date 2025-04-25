
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from '@/types/user-types';

interface UserRoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  roles: { id: string; name: string }[];
  onRoleChange: (userId: string, role: UserRole) => void;
  isDisabled?: boolean;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  userId,
  currentRole,
  roles,
  onRoleChange,
  isDisabled = false
}) => {
  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => onRoleChange(userId, value as UserRole)}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserRoleSelector;
