
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HomeownerListFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  associationFilter: string;
  setAssociationFilter: (value: string) => void;
  associations: any[];
}

const HomeownerListFilters: React.FC<HomeownerListFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  associationFilter,
  setAssociationFilter,
  associations
}) => {
  return (
    <div className="flex gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending-approval">Pending</SelectItem>
        </SelectContent>
      </Select>

      <Select value={associationFilter} onValueChange={setAssociationFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Association" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Associations</SelectItem>
          {associations?.map((association) => (
            <SelectItem key={association.id} value={association.id}>
              {association.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default HomeownerListFilters;
