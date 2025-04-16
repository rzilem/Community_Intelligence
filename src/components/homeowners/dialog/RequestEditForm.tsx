
import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import RequestBasicFields from './fields/RequestBasicFields';
import RequestDescriptionField from './fields/RequestDescriptionField';
import RequestAssignedToField from './fields/RequestAssignedToField';
import RequestAssignmentFields from './fields/RequestAssignmentFields';

interface RequestEditFormProps {
  request: HomeownerRequest | null;
  onSubmit: (values: any) => void;
  isPending: boolean;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  type: z.enum(['maintenance', 'compliance', 'billing', 'general', 'amenity']),
  assigned_to: z.string().optional(),
  association_id: z.string().uuid().optional().nullable(),
  property_id: z.string().uuid().optional().nullable(),
  resident_id: z.string().uuid().optional().nullable(),
});

const RequestEditForm: React.FC<RequestEditFormProps> = ({ 
  request, 
  onSubmit, 
  isPending,
  onCancel
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      type: 'general',
      assigned_to: '',
      association_id: '',
      property_id: '',
      resident_id: '',
    },
  });

  useEffect(() => {
    if (request) {
      form.reset({
        title: request.title,
        description: request.description,
        status: request.status as any,
        priority: request.priority as any,
        type: request.type as any,
        assigned_to: request.assigned_to || '',
        association_id: request.association_id || '',
        property_id: request.property_id || '',
        resident_id: request.resident_id || '',
      });
    }
  }, [request, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <RequestBasicFields form={form} />
          <RequestAssignedToField form={form} />
        </div>
        
        <RequestAssignmentFields form={form} />
        <RequestDescriptionField form={form} />
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RequestEditForm;
