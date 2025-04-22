
import React, { useState } from 'react';
import { CalendarIcon, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';

interface HomeownerRequestAdvancedFiltersProps {
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
}

const HomeownerRequestAdvancedFilters: React.FC<HomeownerRequestAdvancedFiltersProps> = ({ 
  onApplyFilters,
  onResetFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    priority: '' as HomeownerRequestPriority | '',
    type: '' as HomeownerRequestType | '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    assignedToMe: false,
    propertyId: '',
    trackingNumber: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      priority: '',
      type: '',
      dateFrom: undefined,
      dateTo: undefined,
      assignedToMe: false,
      propertyId: '',
      trackingNumber: ''
    });
    onResetFilters();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <FilterX className="h-3.5 w-3.5" />
          <span>Advanced Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="start">
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="search">Search</Label>
              <Input 
                id="search" 
                placeholder="Search in title, description..." 
                value={filters.searchTerm}
                onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger id="priority" className="h-8">
                    <SelectValue placeholder="Any priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="type">Request Type</Label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="type" className="h-8">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="amenity">Amenity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => handleInputChange('dateFrom', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? (
                        format(filters.dateTo, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => handleInputChange('dateTo', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input 
                id="tracking" 
                placeholder="Enter tracking number" 
                value={filters.trackingNumber}
                onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="flex justify-between pt-2">
              <Button variant="destructive" size="sm" onClick={handleResetFilters}>
                Reset
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default HomeownerRequestAdvancedFilters;
