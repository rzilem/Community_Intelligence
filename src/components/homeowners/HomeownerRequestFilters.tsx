
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  HomeownerRequestStatus, 
  HomeownerRequestPriority, 
  HomeownerRequestType 
} from '@/types/homeowner-request-types';

interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: HomeownerRequestStatus | 'all';
  setStatusFilter: React.Dispatch<React.SetStateAction<HomeownerRequestStatus | 'all'>>;
  priorityFilter: HomeownerRequestPriority | 'all';
  setPriorityFilter: React.Dispatch<React.SetStateAction<HomeownerRequestPriority | 'all'>>;
  typeFilter: HomeownerRequestType | 'all';
  setTypeFilter: React.Dispatch<React.SetStateAction<HomeownerRequestType | 'all'>>;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  typeFilter,
  setTypeFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="w-full sm:max-w-sm">
        <Input 
          placeholder="Search requests..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select 
          value={statusFilter} 
          onValueChange={(value) => setStatusFilter(value as HomeownerRequestStatus | 'all')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={priorityFilter} 
          onValueChange={(value) => setPriorityFilter(value as HomeownerRequestPriority | 'all')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={typeFilter} 
          onValueChange={(value) => setTypeFilter(value as HomeownerRequestType | 'all')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="amenity">Amenity</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
