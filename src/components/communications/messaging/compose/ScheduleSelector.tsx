
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleSelectorProps {
  scheduleMessage: boolean;
  scheduledDate: Date | null;
  onToggleSchedule: () => void;
  onScheduledDateChange: (date: Date | null) => void;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  scheduleMessage,
  scheduledDate,
  onToggleSchedule,
  onScheduledDateChange,
}) => {
  const handleTimeChange = (time: string) => {
    if (!scheduledDate) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(scheduledDate);
    newDate.setHours(hours, minutes);
    onScheduledDateChange(newDate);
  };

  // Generate time options (every 30 minutes)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="schedule-toggle" className="font-medium">
          Schedule this message
        </Label>
        <Switch
          id="schedule-toggle"
          checked={scheduleMessage}
          onCheckedChange={onToggleSchedule}
        />
      </div>

      {scheduleMessage && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <div className="flex-1">
            <Label htmlFor="date-picker" className="block mb-2 text-sm">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate || undefined}
                  onSelect={onScheduledDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full sm:w-auto">
            <Label htmlFor="time-picker" className="block mb-2 text-sm">
              Time
            </Label>
            <Select
              disabled={!scheduledDate}
              value={scheduledDate ? `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}` : ""}
              onValueChange={handleTimeChange}
            >
              <SelectTrigger id="time-picker" className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
