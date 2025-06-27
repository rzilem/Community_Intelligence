
import React, { useState } from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { useRequestComments } from '@/hooks/homeowners/useRequestComments';
import { useRequestDialog } from '@/hooks/homeowners/useRequestDialog';
import RequestDialogLayout from './detail/RequestDialogLayout';
import RequestDialogTabs from './dialog/edit/RequestDialogTabs';
import RequestTabsContent from './detail/RequestTabsContent';
import { EmailResponseDialog } from './response/EmailResponseDialog';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

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
  const [emailResponseOpen, setEmailResponseOpen] = useState(false);
  const { comments, loadingComments } = useRequestComments(request?.id || null);
  const { 
    fullscreenEmail, 
    setFullscreenEmail, 
    activeTab, 
    setActiveTab, 
    handleTabChange, 
    handleFullscreenToggle 
  } = useRequestDialog();
  
  if (!request) return null;
  
  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  const handleOpenEmailResponse = () => {
    setEmailResponseOpen(true);
  };

  const handleResponseSent = () => {
    // Refresh the request data or perform other actions after response is sent
    console.log('Response sent, refreshing data...');
  };

  return (
    <>
      <RequestDialogLayout
        open={open}
        onOpenChange={onOpenChange}
        title={request.title}
        showFullscreenButton={activeTab === 'email'}
        isFullscreen={fullscreenEmail}
        onFullscreenToggle={handleFullscreenToggle}
        footerActions={
          <div className="flex gap-2">
            <Button 
              onClick={handleOpenEmailResponse}
              variant="default"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Response
            </Button>
          </div>
        }
      >
        <RequestDialogTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          assignedTo={request.assigned_to || null}
          associationId={request.association_id || null}
          propertyId={request.property_id || null}
          onAssignChange={(value) => console.log('Assign change:', value)}
          onAssociationChange={(value) => console.log('Association change:', value)}
          onPropertyChange={(value) => console.log('Property change:', value)}
        >
          <RequestTabsContent
            request={request}
            processedDescription={processedDescription}
            fullscreenEmail={fullscreenEmail}
            setFullscreenEmail={setFullscreenEmail}
            comments={comments}
            loadingComments={loadingComments}
          />
        </RequestDialogTabs>
      </RequestDialogLayout>

      <EmailResponseDialog
        request={request}
        open={emailResponseOpen}
        onOpenChange={setEmailResponseOpen}
        onResponseSent={handleResponseSent}
      />
    </>
  );
};

export default HomeownerRequestDetailDialog;
