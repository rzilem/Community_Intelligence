
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type AmenityFormValues = {
  name: string;
  description?: string;
  capacity?: number | string;
  booking_fee?: number | string;
  requires_approval?: boolean;
};

interface AmenityFormProps {
  mode: 'create' | 'edit';
  amenity?: any;
  onSubmit: (values: AmenityFormValues, imageFile?: File | null) => void;
  onCancel: () => void;
}

const AmenityForm: React.FC<AmenityFormProps> = ({ mode, amenity, onSubmit, onCancel }) => {
  const [values, setValues] = useState<AmenityFormValues>({
    name: '',
    description: '',
    capacity: '',
    booking_fee: '',
    requires_approval: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (amenity) {
      setValues({
        name: amenity.name || '',
        description: amenity.description || '',
        capacity: amenity.capacity ?? '',
        booking_fee: amenity.booking_fee ?? '',
        requires_approval: !!amenity.requires_approval,
      });
    }
  }, [amenity]);

  const isEdit = useMemo(() => mode === 'edit', [mode]);

  const handleChange = (field: keyof AmenityFormValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Swimming Pool"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief details about this amenity"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={0}
              value={values.capacity as any}
              onChange={(e) => handleChange('capacity', e.target.value)}
              placeholder="e.g., 50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking_fee">Booking Fee</Label>
            <Input
              id="booking_fee"
              type="number"
              min={0}
              step="0.01"
              value={values.booking_fee as any}
              onChange={(e) => handleChange('booking_fee', e.target.value)}
              placeholder="e.g., 25.00"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="requires_approval">Requires Approval</Label>
            <p className="text-xs text-muted-foreground">Requests will need a manager to approve.</p>
          </div>
          <Switch
            id="requires_approval"
            checked={!!values.requires_approval}
            onCheckedChange={(checked) => handleChange('requires_approval', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {isEdit && amenity?.image_url && (
            <img src={amenity.image_url} alt="Amenity" className="h-24 w-24 rounded border object-cover mt-2" />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEdit ? 'Save changes' : 'Create amenity'}</Button>
      </div>
    </form>
  );
};

export default AmenityForm;
