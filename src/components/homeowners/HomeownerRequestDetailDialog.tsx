
import React from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { useRequestComments } from '@/hooks/homeowners/useRequestComments';
import { useRequestDialog } from '@/hooks/homeowners/useRequestDialog';
import RequestDialogLayout from './detail/RequestDialogLayout';
import RequestDialogTabs from './dialog/edit/RequestDialogTabs';
import RequestTabsContent from './detail/RequestTabsContent';

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
  
  return (
    <RequestDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={request.title}
      showFullscreenButton={activeTab === 'email'}
      isFullscreen={fullscreenEmail}
      onFullscreenToggle={handleFullscreenToggle}
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
  );
};

export default HomeownerRequestDetailDialog;
