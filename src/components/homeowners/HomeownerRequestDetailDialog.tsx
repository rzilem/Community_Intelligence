
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { X } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('request-information');
  const [fullscreenEmail, setFullscreenEmail] = useState(false);

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>Request Details: {request.title}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="request-information" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b w-full rounded-none h-12 pb-0">
            <TabsTrigger 
              value="request-information"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Request Information
            </TabsTrigger>
            <TabsTrigger 
              value="original-email"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Original Email
            </TabsTrigger>
            <TabsTrigger 
              value="comments"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              History
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="request-information">
              <DetailsTab request={request} />
            </TabsContent>
            
            <TabsContent value="original-email">
              <OriginalEmailTab 
                htmlContent={request.html_content} 
                fullscreenEmail={fullscreenEmail}
                setFullscreenEmail={setFullscreenEmail}
              />
            </TabsContent>
            
            <TabsContent value="comments">
              <CommentsTab comments={[]} loadingComments={false} />
            </TabsContent>
            
            <TabsContent value="history">
              <HistoryTimeline request={request} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
