
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RequestBasicFields from './fields/RequestBasicFields';
import RequestAssignmentFields from './fields/RequestAssignmentFields';
import RequestNoteField from './fields/RequestNoteField';

interface RequestEditFormProps {
  request: HomeownerRequest | null;
  onSubmit: (values: any) => void;
  isPending: boolean;
  onCancel: () => void;
  compact?: boolean;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  type: z.enum(['maintenance', 'compliance', 'billing', 'general', 'amenity']),
  assigned_to: z.string().optional(),
  association_id: z.string().optional(),
  property_id: z.string().optional(),
  resident_id: z.string().optional(),
  note: z.string().optional(),
});

const RequestEditForm: React.FC<RequestEditFormProps> = ({ 
  request, 
  onSubmit, 
  isPending,
  onCancel,
  compact = false
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request?.title || '',
      description: request?.description || '',
      status: request?.status || 'open',
      priority: request?.priority || 'medium',
      type: request?.type || 'general',
      assigned_to: request?.assigned_to || 'unassigned',
      association_id: request?.association_id || 'unassigned',
      property_id: request?.property_id || 'unassigned',
      resident_id: request?.resident_id || 'unassigned',
      note: '',
    },
  });

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Add Note & Submit Changes</h3>
            <RequestNoteField form={form} compact={true} />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestBasicFields form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestAssignmentFields form={form} optional={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestNoteField form={form} />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {request?.tracking_number && (
              <span>Tracking #: {request.tracking_number}</span>
            )}
          </div>
          <div className="flex space-x-2">
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
          </div>
        </div>
      </form>
    </Form>
  );
};

export default RequestEditForm;
