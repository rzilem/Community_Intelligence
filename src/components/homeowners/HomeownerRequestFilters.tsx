
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeownerRequestPriority, HomeownerRequestStatus, HomeownerRequestType } from '@/types/homeowner-request-types';
import { Search } from 'lucide-react';

interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priority: HomeownerRequestPriority | 'all';
  setPriority: (priority: HomeownerRequestPriority | 'all') => void;
  type: HomeownerRequestType | 'all';
  setType: (type: HomeownerRequestType | 'all') => void;
  status?: HomeownerRequestStatus | 'all' | 'active';
  setStatus?: (status: HomeownerRequestStatus | 'all' | 'active') => void;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priority,
  setPriority,
  type,
  setType,
  status,
  setStatus
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search requests..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as HomeownerRequestPriority | 'all')}
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
          value={type}
          onValueChange={(value) => setType(value as HomeownerRequestType | 'all')}
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
        
        {status && setStatus && (
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as HomeownerRequestStatus | 'all' | 'active')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
