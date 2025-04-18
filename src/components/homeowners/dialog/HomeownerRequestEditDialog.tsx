
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
import RequestEditForm from './RequestEditForm';
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

  if (!request) return null;

  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-7xl w-[95%] flex flex-col max-h-[95vh]">
        <RequestDialogHeader 
          title={request.title}
          trackingNumber={request.tracking_number}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 pt-2 overflow-y-auto flex-shrink-0" style={{ maxHeight: '50vh' }}>
            <RequestDialogTabs activeTab={activeTab} setActiveTab={setActiveTab}>
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

          <div className="p-6 border-t bg-background flex-shrink-0 h-auto">
            <RequestEditForm 
              request={request} 
              onSubmit={handleSubmit} 
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default HomeownerRequestEditDialog;
