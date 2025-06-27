
import React, { useState } from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { useRequestComments } from '@/hooks/homeowners/useRequestComments';
import { useRequestDialog } from '@/hooks/homeowners/useRequestDialog';
import RequestDialogLayout from './detail/RequestDialogLayout';
import RequestDialogTabs from './dialog/edit/RequestDialogTabs';
import RequestTabsContent from './detail/RequestTabsContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

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
  // Move all useState hooks to the top, before any conditional logic
  const [aiResponse, setAiResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const { comments, loadingComments } = useRequestComments(request?.id || null);
  const { 
    fullscreenEmail, 
    setFullscreenEmail, 
    activeTab, 
    setActiveTab, 
    handleTabChange, 
    handleFullscreenToggle 
  } = useRequestDialog();
  
  // Early return after all hooks are declared
  if (!request) return null;
  
  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  const handleGenerate = async () => {
    if (!request) return;
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke('generate-response', { body: { requestData: request } });
    setGenerating(false);
    if (error) {
      toast.error(`Failed to generate response: ${error.message}`);
      return;
    }
    setAiResponse(data.generatedText);
    setShowResponse(true);
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
        <Button onClick={handleGenerate} disabled={generating} variant="secondary">
          {generating ? 'Generating...' : 'Generate Response'}
        </Button>
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

    <AlertDialog open={showResponse} onOpenChange={setShowResponse}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suggested Response</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="whitespace-pre-wrap p-4 text-sm max-h-[50vh] overflow-auto">
          {aiResponse}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowResponse(false)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default HomeownerRequestDetailDialog;
