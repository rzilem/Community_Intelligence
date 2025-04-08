
import React from 'react';
import { Resident } from './resident-types';
import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: Resident['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'inactive':
      return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactive</Badge>;
    case 'pending-approval':
      return <Badge variant="secondary">Pending Approval</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const getResidentTypeBadge = (type: Resident['type']) => {
  switch (type) {
    case 'owner':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Owner</Badge>;
    case 'tenant':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Tenant</Badge>;
    case 'family-member':
      return <Badge variant="outline" className="border-purple-500 text-purple-500">Family Member</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
