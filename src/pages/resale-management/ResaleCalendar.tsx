
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ResaleCalendarView from '@/components/resale/calendar/ResaleCalendarView';
import CriticalInfoTabs from '@/components/resale/calendar/CriticalInfoTabs';

const ResaleCalendar = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    resaleOrders: true,
    propertyInspections: true,
    documentExpirations: true,
    documentUpdates: true
  });

  const handleFilterChange = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  return (
    <PageTemplate 
      title="Resale Calendar" 
      icon={<CalendarIcon className="h-8 w-8" />}
      description="Track resale orders, property inspections, and document deadlines."
      actions={
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Show Events</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="resaleOrders" 
                    checked={filters.resaleOrders}
                    onCheckedChange={() => handleFilterChange('resaleOrders')}
                  />
                  <Label htmlFor="resaleOrders">Resale Orders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="propertyInspections" 
                    checked={filters.propertyInspections}
                    onCheckedChange={() => handleFilterChange('propertyInspections')}
                  />
                  <Label htmlFor="propertyInspections">Property Inspections</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="documentExpirations" 
                    checked={filters.documentExpirations}
                    onCheckedChange={() => handleFilterChange('documentExpirations')}
                  />
                  <Label htmlFor="documentExpirations">Document Expirations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="documentUpdates" 
                    checked={filters.documentUpdates}
                    onCheckedChange={() => handleFilterChange('documentUpdates')}
                  />
                  <Label htmlFor="documentUpdates">Document Updates</Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      }
    >
      <div className="mt-6">
        {/* Add the critical info tabs above the calendar */}
        <CriticalInfoTabs />
        
        <ResaleCalendarView filters={filters} />
      </div>
    </PageTemplate>
  );
};

export default ResaleCalendar;
