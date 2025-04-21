
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { HomeownerRequest, HomeownerRequestComment } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import HomeownerRequestDialogHeader from './detail/HomeownerRequestDialogHeader';
import DetailsTab from './detail/tabs/DetailsTab';
import OriginalEmailTab from './detail/tabs/OriginalEmailTab';
import ActivityFeedTab from './detail/tabs/ActivityFeedTab';
import RequestDialogTabs from './dialog/edit/RequestDialogTabs';
import HistoryTimeline from './history/HistoryTimeline';
import AttachmentsTab from './dialog/tabs/AttachmentsTab';

interface HomeownerRequestDetailDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestDetailDialog: React.FC<HomeownerRequestDetailDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  const [fullscreenEmail, setFullscreenEmail] = useState(false);
  const [comments, setComments] = useState<HomeownerRequestComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  React.useEffect(() => {
    if (open && request && activeTab === 'updates') {
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
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'updates') {
      fetchComments();
    }
  };

  const handleAssignChange = (value: string) => {
    console.log('Assign change:', value);
    // In view-only mode, we just log this action
    toast.info(`Assignment would change to: ${value}`);
  };

  const handleAssociationChange = (value: string) => {
    console.log('Association change:', value);
    // In view-only mode, we just log this action
    toast.info(`Association would change to: ${value}`);
  };

  const handlePropertyChange = (value: string) => {
    console.log('Property change:', value);
    // In view-only mode, we just log this action
    toast.info(`Property would change to: ${value}`);
  };
  
  if (!request) return null;
  
  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';
  
  // Prepare a request object with attachments if none exist
  const requestWithAttachments = {
    ...request,
    attachments: request.attachments || []
  };
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={!fullscreenEmail}
    >
      <DialogContent className={`
        ${fullscreenEmail ? 'max-w-full h-screen m-0 rounded-none' : 'max-w-4xl h-[90vh]'} 
        overflow-hidden flex flex-col gap-4
      `}>
        <HomeownerRequestDialogHeader 
          title={request.title}
          showFullscreenButton={activeTab === 'email'}
          isFullscreen={fullscreenEmail}
          onFullscreenToggle={() => setFullscreenEmail(!fullscreenEmail)}
        />
        
        <RequestDialogTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          assignedTo={request.assigned_to || null}
          associationId={request.association_id || null}
          propertyId={request.property_id || null}
          onAssignChange={handleAssignChange}
          onAssociationChange={handleAssociationChange}
          onPropertyChange={handlePropertyChange}
        >
          <div className="flex-1 min-h-0">
            <TabsContent value="details" className="h-full m-0">
              <ScrollArea className="h-full">
                <DetailsTab request={request} processedDescription={processedDescription} />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="activity" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-4">
                  <HistoryTimeline request={request} />
                  <ActivityFeedTab comments={comments} loadingComments={loadingComments} />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="email" className="h-full m-0">
              <ScrollArea className="h-full">
                <OriginalEmailTab 
                  htmlContent={request.html_content}
                  fullscreenEmail={fullscreenEmail}
                  setFullscreenEmail={setFullscreenEmail}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="attachments" className="h-full m-0">
              <ScrollArea className="h-full">
                <AttachmentsTab request={requestWithAttachments} />
              </ScrollArea>
            </TabsContent>
          </div>
        </RequestDialogTabs>
        
        <DialogFooter>
          <Button 
            onClick={() => {
              setFullscreenEmail(false);
              onOpenChange(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
