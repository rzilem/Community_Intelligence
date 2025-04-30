
import React from 'react';
import { HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import FilterSearchInput from './filters/FilterSearchInput';
import FilterDropdowns from './filters/FilterDropdowns';
import MoreFiltersButton from './filters/MoreFiltersButton';

interface HomeownerRequestFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  status?: HomeownerRequestStatus | 'all';
  setStatus?: (status: HomeownerRequestStatus | 'all') => void;
  priority: HomeownerRequestPriority | 'all';
  setPriority: (priority: HomeownerRequestPriority | 'all') => void;
  type: HomeownerRequestType | 'all';
  setType: (type: HomeownerRequestType | 'all') => void;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  status = 'all',
  setStatus = () => {},
  priority,
  setPriority,
  type,
  setType
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <FilterSearchInput 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <div className="flex flex-wrap gap-2">
        <FilterDropdowns
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          type={type}
          setType={setType}
        />
        
        <MoreFiltersButton />
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
