
import React from 'react';
import { 
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useSupabaseUpdate } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { formatDate } from '@/lib/date-utils';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestEditForm from './RequestEditForm';
import DetailsTab from '../detail/tabs/DetailsTab';
import CommentsTab from '../detail/tabs/CommentsTab';
import OriginalEmailTab from '../detail/tabs/OriginalEmailTab';
import AttachmentsTab from './tabs/AttachmentsTab';
import { cleanHtmlContent } from '@/lib/format-utils';

interface HomeownerRequestEditDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const HomeownerRequestEditDialog: React.FC<HomeownerRequestEditDialogProps> = ({ 
  request, 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('edit');
  const [fullscreenEmail, setFullscreenEmail] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [loadingComments, setLoadingComments] = React.useState(false);
  
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

  const handleSubmit = async (values: any) => {
    if (!request) return;
    
    console.log('Submitting form values:', values);
    
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
          
        if (commentError) {
          console.error('Error adding note:', commentError);
          toast.error('Failed to add note');
          return;
        }
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

  if (!request) return null;

  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-6xl w-[95%]">
        <ResponsiveDialogHeader className="flex items-start justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <ResponsiveDialogTitle className="text-xl">
              Edit Request: {request.title}
            </ResponsiveDialogTitle>
            <div className="text-sm text-muted-foreground">
              Tracking #: {request.tracking_number}
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </ResponsiveDialogHeader>

        <div className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Request Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Title:</div>
                <div>{request.title}</div>
                
                <div className="text-muted-foreground">Type:</div>
                <div className="capitalize">{request.type}</div>
                
                <div className="text-muted-foreground">Status:</div>
                <div>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                    {request.status}
                  </span>
                </div>
                
                <div className="text-muted-foreground">Priority:</div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    request.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                    request.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                    request.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                
                <div className="text-muted-foreground">Created:</div>
                <div>{formatDate(request.created_at)}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Property Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Property ID:</div>
                <div>{request.property_id || 'Not specified'}</div>
                
                <div className="text-muted-foreground">Association:</div>
                <div>{request.association_id || 'Not specified'}</div>
                
                <div className="text-muted-foreground">Resident ID:</div>
                <div>{request.resident_id || 'N/A'}</div>
                
                <div className="text-muted-foreground">Assigned To:</div>
                <div>{request.assigned_to || 'Unassigned'}</div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="email">Original Email</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <RequestEditForm 
                request={request} 
                onSubmit={handleSubmit} 
                isPending={isPending}
                onCancel={() => onOpenChange(false)}
              />
            </TabsContent>

            <TabsContent value="details">
              <DetailsTab request={request} processedDescription={processedDescription} />
            </TabsContent>

            <TabsContent value="comments">
              <CommentsTab 
                comments={comments} 
                loadingComments={loadingComments} 
              />
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
          </Tabs>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default HomeownerRequestEditDialog;
