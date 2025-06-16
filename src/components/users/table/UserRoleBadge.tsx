
import React from 'react';
import { UserRole } from '@/types/profile-types';

interface UserRoleBadgeProps {
  role?: UserRole | 'unassigned';
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role = 'user' }) => {
  const getBadgeClasses = () => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'resident':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'accountant':
        return 'bg-purple-100 text-purple-800';
      case 'treasurer':
        return 'bg-teal-100 text-teal-800';
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center">
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getBadgeClasses()}`}>
        {role}
      </span>
    </div>
  );
};

export default UserRoleBadge;
