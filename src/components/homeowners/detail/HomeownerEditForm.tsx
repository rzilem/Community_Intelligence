
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Homeowner } from '@/components/homeowners/detail/types';
import FormFieldInput from '@/components/homeowners/form/FormFieldInput';
import FormFieldSelect from '@/components/homeowners/form/FormFieldSelect';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

const homeownerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  property: z.string().min(1, 'Property is required'),
  unit: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  moveInDate: z.string().optional(),
  type: z.enum(['owner', 'tenant', 'family-member', 'other']).optional(), // Added 'other' to match our types
});

type HomeownerFormValues = z.infer<typeof homeownerFormSchema>;

interface HomeownerEditFormProps {
  homeowner: Homeowner;
  onSave: (data: Partial<Homeowner>) => void;
  onCancel: () => void;
}

const HomeownerEditForm: React.FC<HomeownerEditFormProps> = ({ 
  homeowner, 
  onSave, 
  onCancel 
}) => {
  const form = useForm<HomeownerFormValues>({
    resolver: zodResolver(homeownerFormSchema),
    defaultValues: {
      name: homeowner.name,
      email: homeowner.email,
      phone: homeowner.phone,
      property: homeowner.property || homeowner.propertyAddress || '',
      unit: homeowner.unit || homeowner.unitNumber || '',
      status: homeowner.status || 'active',
      moveInDate: homeowner.moveInDate,
      type: homeowner.type || 'owner',
    },
  });

  const handleSubmit = async (values: HomeownerFormValues) => {
    try {
      await onSave(values);
      toast.success('Homeowner information updated successfully');
    } catch (error) {
      toast.error('Failed to update homeowner information');
      console.error('Error updating homeowner:', error);
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldInput
                form={form}
                name="name"
                label="Full Name"
                placeholder="Enter full name"
              />
              
              <FormFieldInput
                form={form}
                name="email"
                label="Email"
                placeholder="Enter email address"
                type="email"
              />
              
              <FormFieldInput
                form={form}
                name="phone"
                label="Phone"
                placeholder="Enter phone number"
              />
              
              <FormFieldSelect
                form={form}
                name="status"
                label="Status"
                placeholder="Select status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending-approval', label: 'Pending Approval' },
                ]}
              />
              
              <FormFieldInput
                form={form}
                name="property"
                label="Property Address"
                placeholder="Enter property address"
              />
              
              <FormFieldInput
                form={form}
                name="unit"
                label="Unit"
                placeholder="Enter unit number"
              />
              
              <FormFieldInput
                form={form}
                name="moveInDate"
                label="Move In Date"
                type="date"
                placeholder="Select move in date"
              />
              
              <FormFieldSelect
                form={form}
                name="type"
                label="Resident Type"
                placeholder="Select resident type"
                options={[
                  { value: 'owner', label: 'Owner' },
                  { value: 'tenant', label: 'Tenant' },
                  { value: 'family-member', label: 'Family Member' },
                  { value: 'other', label: 'Other' }, // Added 'other' option
                ]}
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HomeownerEditForm;
