import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequest, HomeownerRequestComment } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import HomeownerRequestDialogHeader from './detail/HomeownerRequestDialogHeader';
import DetailsTab from './detail/tabs/DetailsTab';
import OriginalEmailTab from './detail/tabs/OriginalEmailTab';
import CommentsTab from './detail/tabs/CommentsTab';
import HistoryTimeline from './history/HistoryTimeline';

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
  
  if (!request) return null;
  
  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={!fullscreenEmail}
    >
      <DialogContent className="max-w-7xl w-[95%] bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <HomeownerRequestDialogHeader 
          title={request.title}
          showFullscreenButton={activeTab === 'original'}
          isFullscreen={fullscreenEmail}
          onFullscreenToggle={() => setFullscreenEmail(!fullscreenEmail)}
        />
        
        <Tabs defaultValue="details" className="flex-1" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100/80 p-1">
            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              Request Information
            </TabsTrigger>
            <TabsTrigger value="original" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              Original Email
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              Comments
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-primary">
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <DetailsTab request={request} />
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <OriginalEmailTab 
              htmlContent={request.html_content}
              fullscreenEmail={fullscreenEmail}
              setFullscreenEmail={setFullscreenEmail}
            />
          </TabsContent>
          
          <TabsContent value="updates" className="flex-1 overflow-hidden">
            <CommentsTab comments={comments} loadingComments={loadingComments} />
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 overflow-hidden">
            <div className="p-4">
              <HistoryTimeline request={request} />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="border-t pt-4">
          <Button 
            onClick={() => {
              setFullscreenEmail(false);
              onOpenChange(false);
            }}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
