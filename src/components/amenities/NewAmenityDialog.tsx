
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
import { Switch } from "@/components/ui/switch";
import { Amenity } from '@/types/amenity-types';

interface NewAmenityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity?: Amenity;
  onSubmit: (amenity: Omit<Amenity, 'id' | 'created_at' | 'updated_at'>) => Promise<Amenity | null>;
}

const NewAmenityDialog: React.FC<NewAmenityDialogProps> = ({
  open,
  onOpenChange,
  amenity,
  onSubmit
}) => {
  const [name, setName] = useState(amenity?.name || '');
  const [description, setDescription] = useState(amenity?.description || '');
  const [capacity, setCapacity] = useState<number | undefined>(amenity?.capacity || undefined);
  const [bookingFee, setBookingFee] = useState<number | undefined>(amenity?.booking_fee || undefined);
  const [requiresApproval, setRequiresApproval] = useState(amenity?.requires_approval || false);

  const handleSubmit = async () => {
    if (!name) {
      return;
    }

    const result = await onSubmit({
      name,
      description,
      capacity,
      booking_fee: bookingFee,
      requires_approval: requiresApproval,
      association_id: ''  // This will be set in the hook
    });

    if (result) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCapacity(undefined);
    setBookingFee(undefined);
    setRequiresApproval(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{amenity ? 'Edit Amenity' : 'New Amenity'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Amenity Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pool, Gym, Tennis Court, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the amenity"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity || ''}
                onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Maximum capacity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bookingFee">Booking Fee ($)</Label>
              <Input
                id="bookingFee"
                type="number"
                min="0"
                step="0.01"
                value={bookingFee || ''}
                onChange={(e) => setBookingFee(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="requiresApproval">Requires Approval</Label>
            <Switch
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {amenity ? 'Update Amenity' : 'Create Amenity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewAmenityDialog;
