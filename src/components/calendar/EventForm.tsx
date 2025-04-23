import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';
import { toast } from "sonner";

interface Amenity {
  id: string;
  name: string;
}

interface EventFormProps {
  newEvent: {
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
    amenityId: string;
    color: string;
    description?: string;
    location?: string;
  };
  setNewEvent: React.Dispatch<React.SetStateAction<{
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
    amenityId: string;
    color: string;
    description?: string;
    location?: string;
  }>>;
  amenityOptions: Amenity[];
  handleCreateEvent: () => boolean;
  isCreating: boolean;
  hasAssociation: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  newEvent,
  setNewEvent,
  amenityOptions,
  handleCreateEvent,
  isCreating,
  hasAssociation
}) => {
  const colorOptions = [
    { value: '#3b6aff', label: 'Blue', bgClass: 'bg-hoa-blue-500' },
    { value: '#0d766d', label: 'Teal', bgClass: 'bg-hoa-teal-500' },
    { value: '#8B5CF6', label: 'Purple', bgClass: 'bg-purple-500' },
    { value: '#f97316', label: 'Orange', bgClass: 'bg-orange-500' },
    { value: '#EF4444', label: 'Red', bgClass: 'bg-red-500' },
    { value: '#10B981', label: 'Green', bgClass: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', bgClass: 'bg-yellow-500' },
    { value: '#EC4899', label: 'Pink', bgClass: 'bg-pink-500' }
  ];

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleCreateWrapper = async () => {
    setErrorMsg(null);
    const ok = await handleCreateEvent();
    if (ok === false) {
      setErrorMsg("Unable to book – possible conflict or missing info.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Book an Amenity</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amenity" className="text-right">
            Amenity
          </Label>
          <Select 
            value={newEvent.amenityId}
            onValueChange={(value) => setNewEvent({...newEvent, amenityId: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select an amenity" />
            </SelectTrigger>
            <SelectContent>
              {amenityOptions.map((amenity) => (
                <SelectItem key={amenity.id} value={amenity.id}>{amenity.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input
            id="title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            className="col-span-3 min-h-24"
            placeholder="Event description (optional)"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location
          </Label>
          <Input
            id="location"
            value={newEvent.location || ''}
            onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
            className="col-span-3"
            placeholder="Location (optional)"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="start-time" className="text-right">
            Start Time
          </Label>
          <Input
            id="start-time"
            type="time"
            value={newEvent.startTime}
            onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="end-time" className="text-right">
            End Time
          </Label>
          <Input
            id="end-time"
            type="time"
            value={newEvent.endTime}
            onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-type" className="text-right">
            Event Type
          </Label>
          <Select
            value={newEvent.type}
            onValueChange={(value: any) => setNewEvent({...newEvent, type: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amenity_booking">Amenity Booking</SelectItem>
              <SelectItem value="hoa_meeting">HOA Meeting</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="community_event">Community Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">
            Color
          </Label>
          <div className="col-span-3">
            <RadioGroup 
              value={newEvent.color} 
              onValueChange={(value) => setNewEvent({...newEvent, color: value})}
              className="flex flex-wrap gap-2"
            >
              {colorOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`color-${option.value}`} 
                    className="sr-only"
                  />
                  <Label 
                    htmlFor={`color-${option.value}`} 
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center",
                      option.bgClass,
                      newEvent.color === option.value ? "border-gray-900 ring-2 ring-black" : "border-transparent"
                    )}
                  >
                    {newEvent.color === option.value && (
                      <div className="rounded-full w-2 h-2 bg-white" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        {errorMsg && (
          <div className="text-red-600 text-xs rounded bg-red-50 p-2 mt-2">
            {errorMsg}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button 
          type="button"
          onClick={handleCreateWrapper}
          disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime || !hasAssociation || isCreating}
        >
          {isCreating ? 'Saving...' : 'Book Now'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EventForm;
