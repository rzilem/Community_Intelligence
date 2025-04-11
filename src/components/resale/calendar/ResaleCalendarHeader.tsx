
import React from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ResaleCalendarHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

const ResaleCalendarHeader: React.FC<ResaleCalendarHeaderProps> = ({
  selectedDate,
  setSelectedDate,
  isDialogOpen,
  setIsDialogOpen
}) => {
  const nextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const prevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  return (
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle>
        {format(selectedDate, 'MMM d')} - {format(addWeeks(selectedDate, 1), 'MMM d, yyyy')}
      </CardTitle>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </CardHeader>
  );
};

export default ResaleCalendarHeader;
