
import React from 'react';
import FilterSearchInput from './filters/FilterSearchInput';
import FilterSelect from './filters/FilterSelect';
import { HomeownerRequestPriority, HomeownerRequestType, HomeownerRequestStatus } from '@/types/homeowner-request-types';

interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priority: HomeownerRequestPriority | 'all';
  setPriority: (priority: HomeownerRequestPriority | 'all') => void;
  type: HomeownerRequestType | 'all';
  setType: (type: HomeownerRequestType | 'all') => void;
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

const HomeownerRequestFilters = ({
  searchTerm,
  setSearchTerm,
  priority,
  setPriority,
  type,
  setType
}: HomeownerRequestFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <FilterSearchInput 
        value={searchTerm} 
        onChange={setSearchTerm} 
      />
      
      <div className="flex gap-2">
        <FilterSelect
          value={priority}
          onChange={(value) => setPriority(value as HomeownerRequestPriority | 'all')}
          options={priorityOptions}
          placeholder="Priority"
          label="Priority"
        />
        
        <FilterSelect
          value={type}
          onChange={(value) => setType(value as HomeownerRequestType | 'all')}
          options={typeOptions}
          placeholder="Type"
          label="Type"
        />
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
