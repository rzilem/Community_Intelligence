
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, isWithinInterval, startOfMonth, endOfMonth, isSameMonth, addWeeks, subWeeks, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, CalendarRange } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

// Import calendar-related components
import ResaleEventList from './ResaleEventList';
import ResaleEventForm from './ResaleEventForm';

// Import custom hooks
import { useResaleCalendarEvents } from '@/hooks/resale/useResaleCalendarEvents';

interface ResaleCalendarViewProps {
  className?: string;
  filters: {
    resaleOrders: boolean;
    propertyInspections: boolean;
    documentExpirations: boolean;
    documentUpdates: boolean;
  };
}

export const ResaleCalendarView: React.FC<ResaleCalendarViewProps> = ({ 
  className,
  filters 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [monthDays, setMonthDays] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    events,
    newEvent,
    setNewEvent,
    eventsLoading,
    isCreating,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation
  } = useResaleCalendarEvents({ date: selectedDate, filters });

  useEffect(() => {
    // Get the current week days
    const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const endWeek = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: startWeek, end: endWeek });
    setCurrentWeek(weekDays);

    // Get all days in the current month for the mini-calendar
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });
    setMonthDays(allDays);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const nextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const prevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };
  
  const handleSubmitEvent = () => {
    const success = handleCreateEvent();
    if (success) {
      setIsDialogOpen(false);
    }
    return true;
  };

  // Get events for the current week
  const eventsForCurrentWeek = currentWeek.map(day => {
    return {
      date: day,
      events: events.filter(event => isSameDay(new Date(event.date), day))
    };
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mini month calendar */}
      <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-9 gap-4">
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>
              {format(selectedDate, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, selectedDate);
                const isCurrentDay = isToday(day);
                
                // Check if this day has events
                const hasEvents = events.some(event => isSameDay(new Date(event.date), day));
                
                return (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-xs",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      isCurrentDay && !isSelected && "border border-primary text-primary",
                      hasEvents && !isSelected && "border-dashed border-orange-400"
                    )}
                    onClick={() => handleDateSelect(day)}
                  >
                    {format(day, 'd')}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Week view */}
        <Card className="md:col-span-5 lg:col-span-7">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>
              {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextWeek}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <ResaleEventForm
                  newEvent={{...newEvent, date: selectedDate}}
                  setNewEvent={setNewEvent}
                  handleCreateEvent={handleSubmitEvent}
                  isCreating={isCreating}
                  hasAssociation={hasAssociation}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 h-full divide-x">
              {eventsForCurrentWeek.map(({ date, events }, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "min-h-[60vh] flex flex-col",
                    isToday(date) && "bg-hoa-blue-50 border-t-2 border-t-primary"
                  )}
                >
                  <div className={cn(
                    "py-2 px-3 text-center font-medium sticky top-0 bg-background",
                    isToday(date) && "bg-hoa-blue-50 text-primary"
                  )}>
                    <div>{format(date, 'EEE')}</div>
                    <div className={cn(
                      "text-2xl",
                      isToday(date) && "font-bold text-primary"
                    )}>{format(date, 'd')}</div>
                  </div>
                  <div className="flex-1 p-1 overflow-y-auto">
                    <ResaleEventList
                      events={events}
                      loading={eventsLoading}
                      setIsDialogOpen={setIsDialogOpen}
                      onDeleteEvent={handleDeleteEvent}
                      compact={true}
                      setSelectedDate={() => handleDateSelect(date)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected day detailed view */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between border-b">
          <CardTitle>Events for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ResaleEventList
            events={events.filter(event => isSameDay(new Date(event.date), selectedDate))}
            loading={eventsLoading}
            setIsDialogOpen={setIsDialogOpen}
            onDeleteEvent={handleDeleteEvent}
            compact={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResaleCalendarView;
