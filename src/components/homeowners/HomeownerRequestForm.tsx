
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useSupabaseCreate } from '@/hooks/supabase';
import { useSupabaseQuery } from '@/hooks/supabase';
import RequestBasicInfoFields from './form/RequestBasicInfoFields';
import RequestLocationFields from './form/RequestLocationFields';
import FormFieldTextarea from './form/FormFieldTextarea';

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['maintenance', 'compliance', 'billing', 'general', 'amenity']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  propertyId: z.string().uuid('Please select a property').optional(),
  associationId: z.string().uuid('Please select an association').optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface HomeownerRequestFormProps {
  onSuccess?: () => void;
}

export function HomeownerRequestForm({ onSuccess }: HomeownerRequestFormProps) {
  // Fetch associations for the select dropdown
  const { data: associations = [] } = useSupabaseQuery<any[]>(
    'associations',
    {
      select: 'id, name',
    }
  );

  // Fetch properties for the select dropdown
  const { data: properties = [] } = useSupabaseQuery<any[]>(
    'properties',
    {
      select: 'id, address, unit_number, association_id',
    }
  );

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'maintenance',
      priority: 'medium',
      propertyId: undefined,
      associationId: undefined,
    },
  });

  const { mutate: createRequest, isPending } = useSupabaseCreate('homeowner_requests', {
    onSuccess: () => {
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    // Make sure we're using the database column names for the API call
    const requestData: any = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: 'open',
    };
    
    // Only add these fields if they were provided
    if (data.propertyId) {
      requestData.property_id = data.propertyId;
    }
    
    if (data.associationId) {
      requestData.association_id = data.associationId;
    }
    
    // Create the request with only the provided fields
    createRequest(requestData);
  };

  // Get selected association ID for filtering properties
  const selectedAssociationId = form.watch('associationId');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RequestBasicInfoFields form={form} />
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <p className="text-amber-800 text-sm">
            The location fields below are optional. You can create a request without specifying an association or property.
          </p>
        </div>
        
        <RequestLocationFields 
          form={form} 
          associations={associations} 
          properties={properties}
          selectedAssociationId={selectedAssociationId}
          optional={true}
        />
        
        <FormFieldTextarea
          form={form}
          name="description"
          label="Description"
          placeholder="Describe your request in detail..."
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
