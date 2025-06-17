
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { SortConfig } from '@/hooks/vendors/useSortableTable';

interface VendorQuickFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  sortConfig?: SortConfig;
  onClearSort?: () => void;
}

const VendorQuickFilters: React.FC<VendorQuickFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  onClearFilters,
  hasActiveFilters,
  sortConfig,
  onClearSort
}) => {
  const specialtyOptions = [
    'All Specialties',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Roofing',
    'Painting',
    'Flooring',
    'Carpentry',
    'Cleaning',
    'Security'
  ];

  const hasSorting = sortConfig?.key && sortConfig?.direction;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors, contacts, emails, specialties..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Specialty Filter */}
        <Select value={specialtyFilter} onValueChange={onSpecialtyFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialtyOptions.map(specialty => (
              <SelectItem key={specialty} value={specialty.toLowerCase().replace(' ', '_')}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(hasActiveFilters || hasSorting) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X size={14} />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters and Sort Display */}
      {(hasActiveFilters || hasSorting) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <button onClick={() => onSearchChange('')}>
                <X size={12} />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <button onClick={() => onStatusFilterChange('all')}>
                <X size={12} />
              </button>
            </Badge>
          )}
          {specialtyFilter !== 'all_specialties' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Specialty: {specialtyFilter.replace('_', ' ')}
              <button onClick={() => onSpecialtyFilterChange('all_specialties')}>
                <X size={12} />
              </button>
            </Badge>
          )}
          {hasSorting && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <ArrowUpDown size={12} />
              Sorted by: {sortConfig.key} ({sortConfig.direction})
              {onClearSort && (
                <button onClick={onClearSort}>
                  <X size={12} />
                </button>
              )}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorQuickFilters;
