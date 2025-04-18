
import React from 'react';
import { 
  ResponsiveDialog,
  ResponsiveDialogContent,
} from '@/components/ui/responsive-dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { cleanHtmlContent } from '@/lib/format-utils';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import DetailsTab from '../detail/tabs/DetailsTab';
import CommentsTab from '../detail/tabs/CommentsTab';
import OriginalEmailTab from '../detail/tabs/OriginalEmailTab';
import AttachmentsTab from './tabs/AttachmentsTab';
import RequestDialogHeader from './edit/RequestDialogHeader';
import RequestDialogTabs from './edit/RequestDialogTabs';

interface HomeownerRequestEditDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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

const HomeownerRequestEditDialog: React.FC<HomeownerRequestEditDialogProps> = ({ 
  request, 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('details');
  const [fullscreenEmail, setFullscreenEmail] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  
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
  
  const { mutate: updateRequest, isPending } = useSupabaseUpdate<HomeownerRequest>(
    'homeowner_requests',
    {
      onSuccess: () => {
        toast.success('Request updated successfully');
        onOpenChange(false);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      },
      showErrorToast: true,
    }
  );

  React.useEffect(() => {
    if (open && request && activeTab === 'comments') {
      fetchComments();
    }
  }, [open, request, activeTab]);

  const fetchComments = async () => {
    if (!request) return;
    
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('parent_id', request.id)
        .eq('parent_type', 'homeowner_request')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!request) return;
    
    const updatedData: Partial<HomeownerRequest> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      type: values.type,
      assigned_to: values.assigned_to === 'unassigned' ? null : values.assigned_to,
      association_id: values.association_id === 'unassigned' ? null : values.association_id,
      property_id: values.property_id === 'unassigned' ? null : values.property_id,
      resident_id: values.resident_id === 'unassigned' ? null : values.resident_id
    };
    
    if (values.status === 'resolved' && request.status !== 'resolved') {
      updatedData.resolved_at = new Date().toISOString();
    }
    
    if (values.status !== 'resolved' && request.status === 'resolved') {
      updatedData.resolved_at = null;
    }
    
    if (values.note?.trim()) {
      try {
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            parent_id: request.id,
            parent_type: 'homeowner_request',
            content: values.note.trim(),
            user_id: user?.id || null,
          });
          
        if (commentError) throw commentError;
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to add note');
        return;
      }
    }
    
    updateRequest({
      id: request.id,
      data: updatedData,
    });
  };

  const handleAssignChange = (value: string) => {
    form.setValue('assigned_to', value);
  };

  const handleAssociationChange = (value: string) => {
    form.setValue('association_id', value);
    // Reset property when association changes
    form.setValue('property_id', 'unassigned');
  };

  const handlePropertyChange = (value: string) => {
    form.setValue('property_id', value);
  };

  if (!request) return null;

  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent 
        className="max-w-[95%] w-[105%] flex flex-col max-h-[95vh]" 
      >
        <RequestDialogHeader 
          title={request.title}
          trackingNumber={request.tracking_number}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 pt-2 pb-2 overflow-y-auto flex-shrink-0" style={{ maxHeight: '55vh' }}>
            <RequestDialogTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              assignedTo={form.watch('assigned_to')}
              associationId={form.watch('association_id')}
              propertyId={form.watch('property_id')}
              onAssignChange={handleAssignChange}
              onAssociationChange={handleAssociationChange}
              onPropertyChange={handlePropertyChange}
            >
              <TabsContent value="details">
                <DetailsTab request={request} processedDescription={processedDescription} />
              </TabsContent>

              <TabsContent value="comments">
                <CommentsTab comments={comments} loadingComments={loadingComments} />
              </TabsContent>

              <TabsContent value="email">
                <OriginalEmailTab 
                  htmlContent={request.html_content} 
                  fullscreenEmail={fullscreenEmail}
                  setFullscreenEmail={setFullscreenEmail}
                />
              </TabsContent>

              <TabsContent value="attachments">
                <AttachmentsTab request={request} />
              </TabsContent>
            </RequestDialogTabs>
          </div>

          <div className="p-3 border-t bg-background flex-shrink-0 h-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Add a note or comment..." 
                            className="min-h-[80px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      onClick={() => onOpenChange(false)}
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
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default HomeownerRequestEditDialog;
