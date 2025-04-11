
import React from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import TooltipButton from '@/components/ui/tooltip-button';

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  date, 
  setDate 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <Calendar className="h-4 w-4 mr-2" />
              {date ? format(date, 'PP') : 'Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Select>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="assessments">Assessments</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="fines">Fines</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
          </SelectContent>
        </Select>
        
        <TooltipButton
          variant="outline"
          size="icon"
          tooltip="Additional filters"
        >
          <Filter className="h-4 w-4" />
        </TooltipButton>
        
        <TooltipButton
          variant="outline"
          size="icon"
          tooltip="Export transactions"
        >
          <Download className="h-4 w-4" />
        </TooltipButton>
      </div>
    </div>
  );
};

export default TransactionFilters;
