
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest, HomeownerRequestComment } from '@/types/homeowner-request-types';
import DetailsTab from './tabs/DetailsTab';
import OriginalEmailTab from './tabs/OriginalEmailTab';
import ActivityFeedTab from './tabs/ActivityFeedTab';
import HistoryTimeline from '../history/HistoryTimeline';

interface RequestTabsContentProps {
  request: HomeownerRequest;
  processedDescription: string;
  fullscreenEmail: boolean;
  setFullscreenEmail: (value: boolean) => void;
  comments: HomeownerRequestComment[];
  loadingComments: boolean;
}

const RequestTabsContent: React.FC<RequestTabsContentProps> = ({
  request,
  processedDescription,
  fullscreenEmail,
  setFullscreenEmail,
  comments,
  loadingComments
}) => {
  return (
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
          <div className="p-4">
            Attachments content will go here
          </div>
        </ScrollArea>
      </TabsContent>
    </div>
  );
};

export default RequestTabsContent;
