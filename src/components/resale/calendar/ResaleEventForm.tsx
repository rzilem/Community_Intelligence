
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export interface NewResaleEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  property?: string;
  type: string;
  color: string;
}

interface ResaleEventFormProps {
  newEvent: NewResaleEvent;
  setNewEvent: React.Dispatch<React.SetStateAction<NewResaleEvent>>;
  handleCreateEvent: () => boolean;
  isCreating: boolean;
  hasAssociation: boolean;
}

const ResaleEventForm: React.FC<ResaleEventFormProps> = ({
  newEvent,
  setNewEvent,
  handleCreateEvent,
  isCreating,
  hasAssociation
}) => {
  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>New Resale Order</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Order title"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="text"
              value={format(newEvent.date, 'PPP')}
              readOnly
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="type">Order Type</Label>
            <Select 
              value={newEvent.type} 
              onValueChange={(value) => setNewEvent(prev => ({ 
                ...prev, 
                type: value,
                color: value === 'rush_order' ? '#EF4444' : 
                       value === 'normal_order' ? '#3b6aff' : 
                       value === 'questionnaire' ? '#8B5CF6' : 
                       value === 'inspection' ? '#f97316' : 
                       value === 'document_expiration' ? '#F59E0B' : '#10B981'
              }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rush_order">Rush Order</SelectItem>
                <SelectItem value="normal_order">Normal Order</SelectItem>
                <SelectItem value="questionnaire">Questionnaire</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="document_expiration">Document Expiration</SelectItem>
                <SelectItem value="document_update">Document Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="property">Property</Label>
          <Input
            id="property"
            value={newEvent.property || ''}
            onChange={(e) => setNewEvent(prev => ({ ...prev, property: e.target.value }))}
            placeholder="Property address or name"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Additional details about this order"
            rows={3}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="submit" 
          onClick={handleCreateEvent} 
          disabled={isCreating || !hasAssociation || !newEvent.title}
        >
          {isCreating ? 'Creating...' : 'Create Order'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ResaleEventForm;
