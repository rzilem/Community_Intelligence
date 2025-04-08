
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ResidentWithProfile, Property } from '@/types/app-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResidentFormProps {
  defaultValues: Partial<ResidentWithProfile>;
  onSubmit: (data: Partial<ResidentWithProfile>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ResidentForm: React.FC<ResidentFormProps> = ({ 
  defaultValues, 
  onSubmit,
  isSubmitting,
  onCancel
}) => {
  const { currentAssociation } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<ResidentWithProfile>>({
    defaultValues
  });
  
  const residentType = watch('resident_type');
  const isPrimary = watch('is_primary');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentAssociation) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('association_id', currentAssociation.id);
          
        if (error) throw error;
        setProperties(data as Property[]);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentAssociation]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <div className="col-span-3">
            <Input 
              id="name" 
              placeholder="John Doe"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <div className="col-span-3">
            <Input 
              id="email" 
              type="email"
              placeholder="john@example.com"
              {...register('email', { 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Phone
          </Label>
          <div className="col-span-3">
            <Input 
              id="phone" 
              placeholder="(123) 456-7890"
              {...register('phone')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="resident_type" className="text-right">
            Resident Type
          </Label>
          <div className="col-span-3">
            <Select 
              defaultValue={defaultValues.resident_type || 'owner'} 
              onValueChange={(value) => setValue('resident_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="property_id" className="text-right">
            Property
          </Label>
          <div className="col-span-3">
            <Select 
              defaultValue={defaultValues.property_id} 
              onValueChange={(value) => setValue('property_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading properties..." : "Select a property"} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address} {property.unit_number ? `Unit ${property.unit_number}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="col-start-2 col-span-3 flex items-center space-x-2">
            <Checkbox 
              id="is_primary" 
              checked={isPrimary} 
              onCheckedChange={(checked) => setValue('is_primary', Boolean(checked))}
            />
            <Label 
              htmlFor="is_primary" 
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Primary resident for this property
            </Label>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="move_in_date" className="text-right">
            Move-in Date
          </Label>
          <div className="col-span-3">
            <Input 
              id="move_in_date" 
              type="date"
              {...register('move_in_date')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="move_out_date" className="text-right">
            Move-out Date
          </Label>
          <div className="col-span-3">
            <Input 
              id="move_out_date" 
              type="date"
              {...register('move_out_date')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergency_contact" className="text-right">
            Emergency Contact
          </Label>
          <div className="col-span-3">
            <Input 
              id="emergency_contact" 
              placeholder="Name: (123) 456-7890"
              {...register('emergency_contact')}
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues.id ? 'Update' : 'Add'} Resident
        </Button>
      </DialogFooter>
    </form>
  );
};
