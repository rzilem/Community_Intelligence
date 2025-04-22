
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface HomeownerRequestAdvancedFiltersProps {
  assigneeFilter?: string;
  onAssigneeChange?: React.Dispatch<React.SetStateAction<string>>;
  assignedToFilter?: string;
  onAssignedToChange?: React.Dispatch<React.SetStateAction<string>>;
  dateRangeFilter: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateRangeChange: React.Dispatch<React.SetStateAction<{
    startDate: Date | null;
    endDate: Date | null;
  }>>;
  onClearFilters: () => void;
}

const HomeownerRequestAdvancedFilters: React.FC<HomeownerRequestAdvancedFiltersProps> = ({
  assigneeFilter,
  onAssigneeChange,
  assignedToFilter,
  onAssignedToChange,
  dateRangeFilter,
  onDateRangeChange,
  onClearFilters
}) => {
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onAssigneeChange) onAssigneeChange(value);
    if (onAssignedToChange) onAssignedToChange(value);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    onDateRangeChange(prev => ({
      ...prev,
      startDate: date || null
    }));
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    onDateRangeChange(prev => ({
      ...prev,
      endDate: date || null
    }));
  };

  const assigneeValue = assigneeFilter !== undefined ? assigneeFilter : assignedToFilter;

  return (
    <div className="p-4 bg-muted/40 rounded-md mb-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignee">Assigned To</Label>
          <Input
            id="assignee"
            placeholder="Filter by assignee..."
            value={assigneeValue || ''}
            onChange={handleAssigneeChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeFilter.startDate ? (
                  format(dateRangeFilter.startDate, 'PPP')
                ) : (
                  <span>Pick a start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRangeFilter.startDate || undefined}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeFilter.endDate ? (
                  format(dateRangeFilter.endDate, 'PPP')
                ) : (
                  <span>Pick an end date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRangeFilter.endDate || undefined}
                onSelect={handleEndDateSelect}
                initialFocus
                disabled={(date) => 
                  dateRangeFilter.startDate ? date < dateRangeFilter.startDate : false
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          onClick={onClearFilters}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default HomeownerRequestAdvancedFilters;
