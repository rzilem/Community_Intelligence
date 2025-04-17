
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequest, HomeownerRequestComment } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import HomeownerRequestHistoryDialog from './history/HomeownerRequestHistoryDialog';
import { StatusBadge } from './history/badges/StatusBadge';
import { PriorityBadge } from './history/badges/PriorityBadge';

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
  
  const decodeHtmlEntities = (text: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };
  
  if (!request) return null;
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'updates') {
      fetchComments();
    }
  };
  
  // Process the description to ensure HTML entities are properly displayed
  const processedDescription = request.description ? decodeHtmlEntities(request.description) : '';
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={!fullscreenEmail}
    >
      <DialogContent className={`${fullscreenEmail ? 'max-w-full h-screen m-0 rounded-none' : 'max-w-4xl max-h-[80vh]'} overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Request Details: {request.title}</span>
            {activeTab === 'original' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFullscreenEmail(!fullscreenEmail)}
              >
                {fullscreenEmail ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {fullscreenEmail ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1" value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="details">Request Information</TabsTrigger>
            <TabsTrigger value="original">Original Email</TabsTrigger>
            <TabsTrigger value="updates">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Request Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Title:</div>
                      <div className="font-medium">{request.title}</div>
                      
                      <div className="text-muted-foreground">Type:</div>
                      <div className="capitalize">{request.type}</div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div><StatusBadge status={request.status} /></div>
                      
                      <div className="text-muted-foreground">Priority:</div>
                      <div><PriorityBadge priority={request.priority} /></div>
                      
                      <div className="text-muted-foreground">Created:</div>
                      <div>{formatDate(request.created_at)}</div>

                      <div className="text-muted-foreground">Tracking Number:</div>
                      <div>{request.tracking_number || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Property Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Property ID:</div>
                      <div>{request.property_id || 'Not specified'}</div>
                      
                      <div className="text-muted-foreground">Association ID:</div>
                      <div>{request.association_id || 'Not specified'}</div>
                      
                      <div className="text-muted-foreground">Resident ID:</div>
                      <div>{request.resident_id || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Assigned To:</div>
                      <div>{request.assigned_to || 'Unassigned'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Description</h3>
                  <div className="border rounded-md p-4 whitespace-pre-wrap">
                    {processedDescription}
                  </div>
                </div>
                
                {request.resolved_at && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Resolution</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-muted-foreground">Resolved At:</div>
                      <div>{formatDate(request.resolved_at)}</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <div className={`${fullscreenEmail ? 'h-[calc(100vh-120px)]' : 'h-[60vh]'} flex flex-col`}>
              {request.html_content ? (
                <div className="border rounded-lg flex-1 overflow-hidden">
                  <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
                    <h3 className="font-medium">Original Email Content</h3>
                  </div>
                  <div className="w-full h-full overflow-auto">
                    <iframe 
                      srcDoc={`<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; margin: 20px; }</style></head><body>${request.html_content}</body></html>`}
                      title="Original Email" 
                      className="w-full h-full bg-white"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border rounded-md h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No HTML content available for this request.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="updates" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium text-lg mb-4">Comments &amp; Updates</h3>
                  
                  {loadingComments ? (
                    <div className="text-center py-4">Loading comments...</div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span className="font-medium">
                              {comment.user?.first_name} {comment.user?.last_name || ''}
                            </span>
                            <span>{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-4">No comments available for this request.</div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
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
