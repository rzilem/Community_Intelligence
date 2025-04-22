
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HomeownerRequestAdvancedFiltersProps {
  assignedTo: string;
  setAssignedTo: React.Dispatch<React.SetStateAction<string>>;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  setDateRange: React.Dispatch<React.SetStateAction<{
    startDate: Date | null;
    endDate: Date | null;
  }>>;
  onClearFilters: () => void;
}

const HomeownerRequestAdvancedFilters: React.FC<HomeownerRequestAdvancedFiltersProps> = ({
  assignedTo,
  setAssignedTo,
  dateRange,
  setDateRange,
  onClearFilters
}) => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="assigned-to" className="text-sm font-medium mb-1 block">
          Assigned To
        </label>
        <Input 
          id="assigned-to"
          placeholder="Search by assignee..." 
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">
          Created Date Range
        </label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.startDate ? (
                  format(dateRange.startDate, "PPP")
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.startDate || undefined}
                onSelect={(date) => setDateRange({ ...dateRange, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.endDate ? (
                  format(dateRange.endDate, "PPP")
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.endDate || undefined}
                onSelect={(date) => setDateRange({ ...dateRange, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-end">
        <Button 
          variant="outline" 
          onClick={onClearFilters} 
          className="w-full md:w-auto"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default HomeownerRequestAdvancedFilters;
