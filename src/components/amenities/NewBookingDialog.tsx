
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CalendarEvent } from '@/types/calendar-types';
import { Amenity } from '@/types/amenity-types';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity;
  onSubmit: (booking: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'event_type'>) => Promise<CalendarEvent | null>;
}

const timeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      options.push({
        label: format(time, 'h:mm a'),
        value: format(time, 'HH:mm')
      });
    }
  }
  return options;
};

const NewBookingDialog: React.FC<NewBookingDialogProps> = ({
  open,
  onOpenChange,
  amenity,
  onSubmit
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState(`${amenity.name} Booking`);
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState(amenity.name);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');

  const handleSubmit = async () => {
    // Validate end time is after start time
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    // Create start and end datetime by combining date and time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const result = await onSubmit({
      title,
      description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location,
      visibility,
      amenity_id: amenity.id,
      hoa_id: '',  // This will be set in the hook
      booked_by: '' // This will be set in the hook
    });

    if (result) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setTitle(`${amenity.name} Booking`);
    setDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation(amenity.name);
    setVisibility('private');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {amenity.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Booking title"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="endTime">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions().map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.value <= startTime}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your booking"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Book Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingDialog;
