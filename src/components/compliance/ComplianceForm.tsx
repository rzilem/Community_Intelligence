
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Compliance, Property } from '@/types/app-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ComplianceFormProps {
  defaultValues: Partial<Compliance>;
  properties: Property[];
  loadingProperties: boolean;
  onSubmit: (data: Partial<Compliance>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ComplianceForm: React.FC<ComplianceFormProps> = ({ 
  defaultValues, 
  properties,
  loadingProperties,
  onSubmit,
  isSubmitting,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Partial<Compliance>>({
    defaultValues
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="violation_type" className="text-right">
            Violation Type
          </Label>
          <div className="col-span-3">
            <Select 
              defaultValue={defaultValues.violation_type || 'appearance'} 
              onValueChange={(value) => setValue('violation_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select violation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appearance">Appearance</SelectItem>
                <SelectItem value="noise">Noise</SelectItem>
                <SelectItem value="pet">Pet</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
                <SelectItem value="architectural">Architectural</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
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
                <SelectValue placeholder={loadingProperties ? "Loading properties..." : "Select property"} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address} {property.unit_number ? `Unit ${property.unit_number}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_id && (
              <p className="text-destructive text-sm mt-1">Property is required</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <div className="col-span-3">
            <Textarea 
              id="description" 
              placeholder="Describe the compliance issue in detail"
              className="min-h-[100px]"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <div className="col-span-3">
            <Select 
              defaultValue={defaultValues.status || 'open'} 
              onValueChange={(value: 'open' | 'escalated' | 'resolved') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="due_date" className="text-right">
            Due Date
          </Label>
          <div className="col-span-3">
            <Input 
              id="due_date" 
              type="date"
              {...register('due_date')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fine_amount" className="text-right">
            Fine Amount
          </Label>
          <div className="col-span-3">
            <Input 
              id="fine_amount" 
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('fine_amount', {
                valueAsNumber: true,
                validate: value => !value || value >= 0 || 'Must be a positive number'
              })}
            />
            {errors.fine_amount && (
              <p className="text-destructive text-sm mt-1">{errors.fine_amount.message}</p>
            )}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues.id ? 'Update' : 'Report'} Issue
        </Button>
      </DialogFooter>
    </form>
  );
};
