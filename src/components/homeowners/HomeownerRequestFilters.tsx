
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

export interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter?: HomeownerRequestStatus | 'all';
  setStatusFilter?: (status: HomeownerRequestStatus | 'all') => void;
  priorityFilter?: HomeownerRequestPriority | 'all';
  setPriorityFilter?: (priority: HomeownerRequestPriority | 'all') => void;
  typeFilter?: HomeownerRequestType | 'all';
  setTypeFilter?: (type: HomeownerRequestType | 'all') => void;
  
  // Alternative prop names
  onSearchChange?: (term: string) => void;
  onStatusChange?: (status: HomeownerRequestStatus | 'all') => void;
  onPriorityChange?: (priority: HomeownerRequestPriority | 'all') => void;
  onTypeChange?: (type: HomeownerRequestType | 'all') => void;
  
  priority?: HomeownerRequestPriority | 'all' | '';
  setPriority?: (priority: HomeownerRequestPriority | 'all' | '') => void;
  type?: HomeownerRequestType | 'all' | '';
  setType?: (type: HomeownerRequestType | 'all' | '') => void;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  typeFilter,
  setTypeFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
  priority,
  setPriority,
  type,
  setType
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (setSearchTerm) setSearchTerm(value);
    if (onSearchChange) onSearchChange(value);
  };
  
  const handleStatusChange = (value: string) => {
    if (setStatusFilter) setStatusFilter(value as HomeownerRequestStatus | 'all');
    if (onStatusChange) onStatusChange(value as HomeownerRequestStatus | 'all');
  };
  
  const handlePriorityChange = (value: string) => {
    if (setPriorityFilter) setPriorityFilter(value as HomeownerRequestPriority | 'all');
    if (setPriority) setPriority(value as HomeownerRequestPriority | 'all' | '');
    if (onPriorityChange) onPriorityChange(value as HomeownerRequestPriority | 'all');
  };
  
  const handleTypeChange = (value: string) => {
    if (setTypeFilter) setTypeFilter(value as HomeownerRequestType | 'all');
    if (setType) setType(value as HomeownerRequestType | 'all' | '');
    if (onTypeChange) onTypeChange(value as HomeownerRequestType | 'all');
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      
      {(setStatusFilter || onStatusChange) && (
        <div className="w-full md:w-40">
          <Select 
            value={statusFilter || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
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
        </div>
      )}
      
      {(setPriorityFilter || setPriority || onPriorityChange) && (
        <div className="w-full md:w-40">
          <Select 
            value={(priorityFilter || priority || 'all')} 
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger>
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
        </div>
      )}
      
      {(setTypeFilter || setType || onTypeChange) && (
        <div className="w-full md:w-40">
          <Select 
            value={(typeFilter || type || 'all')} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
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
      )}
    </div>
  );
};

export default HomeownerRequestFilters;
