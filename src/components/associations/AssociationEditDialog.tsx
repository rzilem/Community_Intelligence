
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Association } from '@/types/association-types';

import AssociationFormSectionAddress from './edit/AssociationFormSectionAddress';
import AssociationFormSectionContact from './edit/AssociationFormSectionContact';
import AssociationFormSectionPropertyInfo from './edit/AssociationFormSectionPropertyInfo';
import AssociationFormSectionDatesDescription from './edit/AssociationFormSectionDatesDescription';

// Add all relevant association fields for editing
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  contact_email: z.string().email({ message: 'Invalid email address.' }).or(z.literal('')).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  property_type: z.string().optional(),
  total_units: z.coerce.number().optional(),
  website: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).optional(),
  description: z.string().optional(),
  insurance_expiration: z.string().optional(),
  fire_inspection_due: z.string().optional(),
  founded_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).or(z.string()).optional()
});

export const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' }
];

interface AssociationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association: Association;
  onSave: (data: Partial<Association>) => void;
}

const AssociationEditDialog: React.FC<AssociationEditDialogProps> = ({
  open,
  onOpenChange,
  association,
  onSave,
}) => {
  console.log('Initial association data:', association);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: association.name || '',
      contact_email: association.contact_email || '',
      address: association.address || '',
      city: association.city || '',
      state: association.state || '',
      zip: association.zip || '',
      phone: association.phone || '',
      property_type: association.property_type || '',
      total_units: association.total_units ?? undefined,
      website: association.website || '',
      description: association.description || '',
      insurance_expiration: association.insurance_expiration || '',
      fire_inspection_due: association.fire_inspection_due || '',
      founded_date: association.founded_date || '',
      status: association.status ?? undefined
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting form values:', values);
    
    // Ensure we have the correct data type for total_units
    const formattedValues = {
      ...values,
      total_units: values.total_units ? parseInt(String(values.total_units)) : undefined
    };
    
    onSave(formattedValues);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[575px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Association</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Association Name</label>
              <input
                className="input input-bordered w-full"
                placeholder="Enter association name"
                {...form.register("name")}
              />
            </div>
            {/* Address Section */}
            <AssociationFormSectionAddress control={form.control} />
            {/* Contact Section */}
            <AssociationFormSectionContact control={form.control} />
            {/* Property Info Section */}
            <AssociationFormSectionPropertyInfo control={form.control} />
            {/* Dates & Description Section */}
            <AssociationFormSectionDatesDescription control={form.control} />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssociationEditDialog;
