
import React from 'react';
import FilterSearchInput from './filters/FilterSearchInput';
import FilterSelect from './filters/FilterSelect';
import { HomeownerRequestPriority, HomeownerRequestType, HomeownerRequestStatus } from '@/types/homeowner-request-types';

interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priority: HomeownerRequestPriority | 'all';
  setPriority: (priority: string) => void;
  type: HomeownerRequestType | 'all';
  setType: (type: string) => void;
  status?: HomeownerRequestStatus | 'all' | 'active';
  setStatus?: (status: string) => void;
}

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'billing', label: 'Billing' },
  { value: 'general', label: 'General' },
  { value: 'amenity', label: 'Amenity' }
];

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
      <FilterSearchInput 
        value={searchTerm} 
        onChange={setSearchTerm} 
      />
      
      <div className="flex gap-2">
        <FilterSelect
          value={priority}
          onChange={setPriority}
          options={priorityOptions}
          placeholder="Priority"
          label="Priority"
        />
        
        <FilterSelect
          value={type}
          onChange={setType}
          options={typeOptions}
          placeholder="Type"
          label="Type"
        />
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
