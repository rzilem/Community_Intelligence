
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

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
  association_id: z.string().optional(),
  property_id: z.string().optional(),
  resident_id: z.string().optional(),
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
      assigned_to: 'unassigned',
      association_id: '',
      property_id: '',
      resident_id: '',
    },
  });

  useEffect(() => {
    if (request) {
      // Use consistent field names that match database columns
      form.reset({
        title: request.title,
        description: request.description,
        status: request.status as any,
        priority: request.priority as any,
        type: request.type as any,
        assigned_to: request.assigned_to || 'unassigned',
        association_id: request.association_id || '',
        property_id: request.property_id || '',
        resident_id: request.resident_id || '',
      });
    }
  }, [request, form]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form values before submission:', values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Basic information */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RequestBasicFields form={form} />
              </div>
            </CardContent>
          </Card>
          
          {/* Middle column - Assignment */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RequestAssignedToField form={form} />
                <RequestAssignmentFields form={form} optional={true} inline={true} />
              </div>
            </CardContent>
          </Card>
          
          {/* Right column - Description */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestDescriptionField form={form} />
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <ResponsiveContainer 
            className="w-full flex items-center justify-between"
            mobileClassName="flex-col space-y-2"
            desktopClassName="flex-row space-x-2"
          >
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
          </ResponsiveContainer>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RequestEditForm;
