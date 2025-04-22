
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
  onSearchChange?: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>> | ((term: string) => void);
  statusFilter?: HomeownerRequestStatus | 'all';
  onStatusChange?: React.Dispatch<React.SetStateAction<HomeownerRequestStatus | 'all'>>;
  priorityFilter?: HomeownerRequestPriority | 'all';
  onPriorityChange?: React.Dispatch<React.SetStateAction<HomeownerRequestPriority | 'all'>>;
  typeFilter?: HomeownerRequestType | 'all';
  onTypeChange?: React.Dispatch<React.SetStateAction<HomeownerRequestType | 'all'>>;
  // For backward compatibility with other components
  priority?: HomeownerRequestPriority | '';
  setPriority?: React.Dispatch<React.SetStateAction<HomeownerRequestPriority | ''>> | ((val: any) => void);
  type?: HomeownerRequestType | '';
  setType?: React.Dispatch<React.SetStateAction<HomeownerRequestType | ''>> | ((val: any) => void);
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  onSearchChange,
  setSearchTerm,
  statusFilter = 'all',
  onStatusChange,
  priorityFilter = 'all',
  onPriorityChange,
  typeFilter = 'all',
  onTypeChange,
  // For backward compatibility
  priority = '',
  setPriority,
  type = '',
  setType
}) => {
  // Ensure we use either onSearchChange or setSearchTerm for compatibility
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) onSearchChange(value);
    if (setSearchTerm) setSearchTerm(value);
  };

  // Use priority/type or priorityFilter/typeFilter based on what's provided
  const currentPriority = priorityFilter !== 'all' ? priorityFilter : (priority || 'all');
  const currentType = typeFilter !== 'all' ? typeFilter : (type || 'all');

  const handlePriorityChange = (value: string) => {
    if (onPriorityChange) onPriorityChange(value as HomeownerRequestPriority | 'all');
    if (setPriority) setPriority(value === 'all' ? '' : value as HomeownerRequestPriority);
  };

  const handleTypeChange = (value: string) => {
    if (onTypeChange) onTypeChange(value as HomeownerRequestType | 'all');
    if (setType) setType(value === 'all' ? '' : value as HomeownerRequestType);
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
        {(onStatusChange || statusFilter !== 'all') && (
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusChange && onStatusChange(value as HomeownerRequestStatus | 'all')}
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
        )}
        
        <Select
          value={currentPriority}
          onValueChange={handlePriorityChange}
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
          value={currentType}
          onValueChange={handleTypeChange}
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
