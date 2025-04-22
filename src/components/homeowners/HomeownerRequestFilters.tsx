
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  HomeownerRequestStatus, 
  HomeownerRequestPriority, 
  HomeownerRequestType 
} from '@/types/homeowner-request-types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface HomeownerRequestFiltersProps {
  searchTerm: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: HomeownerRequestStatus | 'all';
  onStatusChange: React.Dispatch<React.SetStateAction<HomeownerRequestStatus | 'all'>>;
  priorityFilter: HomeownerRequestPriority | 'all';
  onPriorityChange: React.Dispatch<React.SetStateAction<HomeownerRequestPriority | 'all'>>;
  typeFilter: HomeownerRequestType | 'all';
  onTypeChange: React.Dispatch<React.SetStateAction<HomeownerRequestType | 'all'>>;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  onSearchChange,
  setSearchTerm,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  typeFilter,
  onTypeChange
}) => {
  // Ensure we use either onSearchChange or setSearchTerm for compatibility
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
    if (setSearchTerm) setSearchTerm(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="w-full md:w-2/5">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-3/5">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as HomeownerRequestStatus | 'all')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select
          value={priorityFilter}
          onValueChange={(value) => onPriorityChange(value as HomeownerRequestPriority | 'all')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select
          value={typeFilter}
          onValueChange={(value) => onTypeChange(value as HomeownerRequestType | 'all')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="amenity">Amenity</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
