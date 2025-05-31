
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface HomeownerRequestFiltersProps {
  filters?: {
    activeTab?: string;
    searchTerm?: string;
    priority?: string;
    type?: string;
  };
  onFiltersChange?: (filters: any) => void;
  // Alternative props pattern
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  priority?: any;
  setPriority?: any;
  type?: any;
  setType?: any;
}

const HomeownerRequestFilters: React.FC<HomeownerRequestFiltersProps> = ({
  filters,
  onFiltersChange,
  searchTerm: directSearchTerm,
  setSearchTerm: directSetSearchTerm,
  priority: directPriority,
  setPriority: directSetPriority,
  type: directType,
  setType: directSetType
}) => {
  // Use direct props if available, otherwise use filters object
  const searchTerm = directSearchTerm ?? filters?.searchTerm ?? '';
  const priority = directPriority ?? filters?.priority ?? 'all';
  const type = directType ?? filters?.type ?? 'all';
  const activeTab = filters?.activeTab ?? 'active';

  const handleSearchChange = (value: string) => {
    if (directSetSearchTerm) {
      directSetSearchTerm(value);
    } else if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, searchTerm: value });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (directSetPriority) {
      directSetPriority(value);
    } else if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, priority: value });
    }
  };

  const handleTypeChange = (value: string) => {
    if (directSetType) {
      directSetType(value);
    } else if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, type: value });
    }
  };

  const handleTabChange = (value: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, activeTab: value });
    }
  };

  const filterValues = { searchTerm, priority, type, activeTab };
  const activeFiltersCount = Object.values(filterValues).filter(value => 
    value && value !== 'all' && value !== '' && value !== 'active'
  ).length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="inquiry">Inquiry</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>

        {onFiltersChange && (
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {activeFiltersCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default HomeownerRequestFilters;
