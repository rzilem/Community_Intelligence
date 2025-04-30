
import React from 'react';
import FilterSelect from './FilterSelect';
import { HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

interface FilterDropdownsProps {
  status: HomeownerRequestStatus | 'all';
  setStatus: (status: string) => void;
  priority: HomeownerRequestPriority | 'all';
  setPriority: (priority: string) => void;
  type: HomeownerRequestType | 'all';
  setType: (type: string) => void;
}

const FilterDropdowns: React.FC<FilterDropdownsProps> = ({
  status,
  setStatus,
  priority,
  setPriority,
  type,
  setType
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

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

  return (
    <div className="flex flex-wrap gap-2">
      <FilterSelect
        value={status}
        onChange={setStatus}
        label="Status"
        options={statusOptions}
        placeholder="Status"
      />
      
      <FilterSelect
        value={priority}
        onChange={setPriority}
        label="Priority"
        options={priorityOptions}
        placeholder="Priority"
      />
      
      <FilterSelect
        value={type}
        onChange={setType}
        label="Type"
        options={typeOptions}
        placeholder="Type"
      />
    </div>
  );
};

export default FilterDropdowns;
