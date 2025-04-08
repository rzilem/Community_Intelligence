
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  };
  setNewEvent: React.Dispatch<React.SetStateAction<{
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
    amenityId: string;
  }>>;
  amenityOptions: Amenity[];
  handleCreateEvent: () => void;
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
      </div>
      <DialogFooter>
        <Button 
          onClick={handleCreateEvent} 
          disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime || !hasAssociation || isCreating}
        >
          {isCreating ? 'Saving...' : 'Book Now'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EventForm;
