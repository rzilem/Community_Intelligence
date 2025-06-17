
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, X, Save, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SearchFilters {
  dateRange?: { start: string; end: string };
  types?: string[];
  status?: string[];
  associations?: string[];
  priority?: string[];
  assignedTo?: string[];
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSaveSearch: (name: string) => void;
  onExportResults: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSaveSearch,
  onExportResults,
  isOpen,
  onToggle
}) => {
  const [saveSearchName, setSaveSearchName] = useState('');

  const typeOptions = [
    { value: 'association', label: 'Associations' },
    { value: 'request', label: 'Requests' },
    { value: 'lead', label: 'Leads' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'property', label: 'Properties' },
    { value: 'vendor', label: 'Vendors' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof SearchFilters, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const newValues = (filters[key] as string[]).filter(v => v !== value);
      updateFilter(key, newValues.length > 0 ? newValues : undefined);
    } else {
      updateFilter(key, undefined);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName.trim());
      setSaveSearchName('');
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="p-4 space-y-4">
            {/* Active Filters */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                {filters.types?.map(type => (
                  <Badge key={type} variant="secondary" className="gap-1">
                    Type: {type}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('types', type)} />
                  </Badge>
                ))}
                {filters.status?.map(status => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    Status: {status}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('status', status)} />
                  </Badge>
                ))}
                {filters.priority?.map(priority => (
                  <Badge key={priority} variant="secondary" className="gap-1">
                    Priority: {priority}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('priority', priority)} />
                  </Badge>
                ))}
                {filters.dateRange && (
                  <Badge variant="secondary" className="gap-1">
                    Date Range
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('dateRange')} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            )}

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select
                  value={filters.types?.[0] || ''}
                  onValueChange={(value) => updateFilter('types', value ? [value] : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={(value) => updateFilter('status', value ? [value] : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority?.[0] || ''}
                  onValueChange={(value) => updateFilter('priority', value ? [value] : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                value={filters.dateRange ? {
                  from: new Date(filters.dateRange.start),
                  to: new Date(filters.dateRange.end)
                } : undefined}
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    updateFilter('dateRange', {
                      start: range.from.toISOString().split('T')[0],
                      end: range.to.toISOString().split('T')[0]
                    });
                  } else {
                    updateFilter('dateRange', undefined);
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Save search as..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleSaveSearch}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={onExportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedSearchFilters;
