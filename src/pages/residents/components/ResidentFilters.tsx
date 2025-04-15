
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ResidentFiltersProps {
  filterAssociation: string;
  setFilterAssociation: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  associations: any[];
}

const ResidentFilters: React.FC<ResidentFiltersProps> = ({
  filterAssociation,
  setFilterAssociation,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  associations
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filterAssociation} onValueChange={setFilterAssociation}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Associations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Associations</SelectItem>
          {associations.map(assoc => (
            <SelectItem key={assoc.id} value={assoc.name}>{assoc.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending-approval">Pending Approval</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="tenant">Tenant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ResidentFilters;
