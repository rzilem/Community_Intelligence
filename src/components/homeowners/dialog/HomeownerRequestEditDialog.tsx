import React from 'react';
import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { TabsContent } from '@/components/ui/tabs';
import DetailsTab from '../detail/tabs/DetailsTab';
import CommentsTab from '../detail/tabs/CommentsTab';
import OriginalEmailTab from '../detail/tabs/OriginalEmailTab';
import AttachmentsTab from './tabs/AttachmentsTab';
import RequestDialogHeader from './edit/RequestDialogHeader';
import RequestDialogTabs from './edit/RequestDialogTabs';
import RequestFormFields from './edit/RequestFormFields';
import RequestFormActions from './edit/RequestFormActions';
import { useRequestForm } from './edit/useRequestForm';
import ActivityFeedTab from '../detail/tabs/ActivityFeedTab';

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
  const [activeTab, setActiveTab] = React.useState('details');
  const [fullscreenEmail, setFullscreenEmail] = React.useState(false);
  
  const {
    form,
    isPending,
    comments,
    loadingComments,
    fetchComments,
    handleSubmit
  } = useRequestForm(request, onOpenChange, onSuccess);

  React.useEffect(() => {
    if (open && request && activeTab === 'activity') {
      fetchComments();
    }
  }, [open, request, activeTab, fetchComments]);

  const handleAssignChange = (value: string) => {
    form.setValue('assigned_to', value);
  };

  const handleAssociationChange = (value: string) => {
    form.setValue('association_id', value);
    form.setValue('property_id', 'unassigned');
  };

  const handlePropertyChange = (value: string) => {
    form.setValue('property_id', value);
  };

  if (!request) return null;

  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent 
        className="max-w-[800px] w-[95%] h-[80vh] flex flex-col" 
      >
        <RequestDialogHeader 
          title={request.title}
          trackingNumber={request.tracking_number}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 pt-2 pb-2 flex-1 overflow-hidden flex flex-col">
            <RequestDialogTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              assignedTo={form.watch('assigned_to')}
              associationId={form.watch('association_id')}
              propertyId={form.watch('property_id')}
              onAssignChange={handleAssignChange}
              onAssociationChange={handleAssociationChange}
              onPropertyChange={handlePropertyChange}
            >
              <TabsContent value="details" className="flex-1 m-0 overflow-hidden">
                <DetailsTab request={request} processedDescription={processedDescription} />
              </TabsContent>

              <TabsContent value="activity" className="flex-1 m-0 overflow-hidden">
                <ActivityFeedTab comments={comments} loadingComments={loadingComments} />
              </TabsContent>

              <TabsContent value="email" className="flex-1 m-0 overflow-hidden">
                <OriginalEmailTab 
                  htmlContent={request.html_content} 
                  fullscreenEmail={fullscreenEmail}
                  setFullscreenEmail={setFullscreenEmail}
                />
              </TabsContent>

              <TabsContent value="attachments" className="flex-1 m-0 overflow-hidden">
                <AttachmentsTab request={request} />
              </TabsContent>
            </RequestDialogTabs>
          </div>

          <div className="p-3 border-t bg-background flex-shrink-0 h-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <RequestFormFields form={form} />
                <RequestFormActions 
                  trackingNumber={request.tracking_number}
                  isPending={isPending}
                  onCancel={() => onOpenChange(false)}
                />
              </form>
            </Form>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default HomeownerRequestEditDialog;
