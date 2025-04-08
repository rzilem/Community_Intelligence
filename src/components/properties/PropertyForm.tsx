
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Property } from '@/types/app-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFormProps {
  defaultValues: Partial<Property>;
  onSubmit: (data: Partial<Property>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ 
  defaultValues, 
  onSubmit,
  isSubmitting,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<Property>>({
    defaultValues
  });
  
  const propertyType = watch('property_type');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="property_type" className="text-right">
            Property Type
          </Label>
          <div className="col-span-3">
            <Select 
              defaultValue={defaultValues.property_type || 'single_family'} 
              onValueChange={(value) => setValue('property_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="condo">Condominium</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            Address
          </Label>
          <div className="col-span-3">
            <Input 
              id="address" 
              placeholder="123 Main St"
              {...register('address', { required: 'Address is required' })}
            />
            {errors.address && (
              <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
            )}
          </div>
        </div>
        
        {(propertyType === 'condo' || propertyType === 'apartment') && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit_number" className="text-right">
              Unit Number
            </Label>
            <div className="col-span-3">
              <Input 
                id="unit_number" 
                placeholder="101"
                {...register('unit_number')}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="city" className="text-right">
            City
          </Label>
          <div className="col-span-3">
            <Input 
              id="city" 
              placeholder="Cityville"
              {...register('city')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="state" className="text-right">
            State
          </Label>
          <div className="col-span-3">
            <Input 
              id="state" 
              placeholder="CA"
              {...register('state')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="zip" className="text-right">
            ZIP Code
          </Label>
          <div className="col-span-3">
            <Input 
              id="zip" 
              placeholder="90210"
              {...register('zip')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input 
              id="bedrooms" 
              type="number"
              placeholder="3"
              min="0"
              {...register('bedrooms', { 
                valueAsNumber: true,
                validate: value => !value || value >= 0 || 'Must be a positive number'
              })}
            />
            {errors.bedrooms && (
              <p className="text-destructive text-sm">{errors.bedrooms.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input 
              id="bathrooms" 
              type="number"
              placeholder="2"
              min="0"
              step="0.5"
              {...register('bathrooms', { 
                valueAsNumber: true,
                validate: value => !value || value >= 0 || 'Must be a positive number'
              })}
            />
            {errors.bathrooms && (
              <p className="text-destructive text-sm">{errors.bathrooms.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="square_feet" className="text-right">
            Square Footage
          </Label>
          <div className="col-span-3">
            <Input 
              id="square_feet" 
              type="number"
              placeholder="1500"
              min="0"
              {...register('square_feet', { 
                valueAsNumber: true,
                validate: value => !value || value >= 0 || 'Must be a positive number'
              })}
            />
            {errors.square_feet && (
              <p className="text-destructive text-sm">{errors.square_feet.message}</p>
            )}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues.id ? 'Update' : 'Add'} Property
        </Button>
      </DialogFooter>
    </form>
  );
};
