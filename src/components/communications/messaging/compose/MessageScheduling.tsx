
import React from 'react';
import { Calendar } from 'lucide-react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageSchedulingProps {
  isScheduled: boolean;
  onScheduleChange: (isScheduled: boolean) => void;
  scheduledDate: Date | null;
  onDateChange: (date: Date | null) => void;
  scheduledTime: string;
  onTimeChange: (time: string) => void;
}

const MessageScheduling: React.FC<MessageSchedulingProps> = ({
  isScheduled,
  onScheduleChange,
  scheduledDate,
  onDateChange,
  scheduledTime,
  onTimeChange
}) => {
  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <FormLabel htmlFor="schedule-switch" className="cursor-pointer">
          Schedule for later
        </FormLabel>
        <Switch
          id="schedule-switch"
          checked={isScheduled}
          onCheckedChange={onScheduleChange}
        />
      </div>

      {isScheduled && (
        <div className="space-y-4 pt-2">
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={scheduledDate || undefined}
                  onSelect={onDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </FormItem>

          <FormItem className="flex flex-col">
            <FormLabel>Time</FormLabel>
            <Select
              value={scheduledTime}
              onValueChange={onTimeChange}
              disabled={!scheduledDate}
            >
              <SelectTrigger>
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
          </FormItem>
        </div>
      )}
    </div>
  );
};

export default MessageScheduling;
