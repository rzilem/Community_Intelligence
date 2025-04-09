
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { OperationsDashboardFilters } from '@/types/operations-types';

interface DashboardFiltersProps {
  filters: OperationsDashboardFilters;
  onFilterChange: (name: keyof OperationsDashboardFilters, value: string) => void;
  className?: string;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ 
  filters, 
  onFilterChange,
  className 
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <Select 
        value={filters.timeRange} 
        onValueChange={(value) => onFilterChange('timeRange', value)}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          <SelectItem value="Last 60 Days">Last 60 Days</SelectItem>
          <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
          <SelectItem value="Year to Date">Year to Date</SelectItem>
          <SelectItem value="Last Year">Last Year</SelectItem>
        </SelectContent>
      </Select>
      
      <Select 
        value={filters.portfolio} 
        onValueChange={(value) => onFilterChange('portfolio', value)}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Select portfolio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Portfolios">All Portfolios</SelectItem>
          <SelectItem value="West Region">West Region</SelectItem>
          <SelectItem value="East Region">East Region</SelectItem>
          <SelectItem value="North Region">North Region</SelectItem>
          <SelectItem value="South Region">South Region</SelectItem>
        </SelectContent>
      </Select>
      
      <Select 
        value={filters.office} 
        onValueChange={(value) => onFilterChange('office', value)}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Select office" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Offices">All Offices</SelectItem>
          <SelectItem value="Austin">Austin</SelectItem>
          <SelectItem value="Round Rock">Round Rock</SelectItem>
          <SelectItem value="Dallas">Dallas</SelectItem>
          <SelectItem value="Houston">Houston</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DashboardFilters;
