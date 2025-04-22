
import React from 'react';
import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { cleanHtmlContent } from '@/lib/format-utils';
import { TabsContent } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import DetailsTab from '../detail/tabs/DetailsTab';
import CommentsTab from '../detail/tabs/CommentsTab';
import OriginalEmailTab from '../detail/tabs/OriginalEmailTab';
import AttachmentsTab from './tabs/AttachmentsTab';
import RequestDialogHeader from './edit/RequestDialogHeader';
import RequestDialogTabs from './edit/RequestDialogTabs';
import RequestFormFields from './edit/RequestFormFields';
import RequestFormActions from './edit/RequestFormActions';
import { useRequestForm } from './edit/useRequestForm';

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
    isSubmitting,
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
  
  const onCancel = () => {
    onOpenChange(false);
  };

  if (!request) return null;

  const processedDescription = request.description ? cleanHtmlContent(request.description) : '';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent 
        className="max-w-[95%] w-[105%] flex flex-col max-h-[95vh]" 
      >
        <RequestDialogHeader 
          title={request.title}
          trackingNumber={request.tracking_number}
          onClose={() => onOpenChange(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 pt-2 pb-2 overflow-y-auto flex-shrink-0 flex flex-col" style={{ height: '500px' }}>
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
              <div className="flex-1 h-full overflow-auto">
                <TabsContent value="details" className="h-full m-0">
                  <DetailsTab request={request} processedDescription={processedDescription} />
                </TabsContent>

                <TabsContent value="activity" className="h-full m-0">
                  <CommentsTab comments={comments} loadingComments={loadingComments} />
                </TabsContent>

                <TabsContent value="email" className="h-full m-0">
                  <OriginalEmailTab 
                    htmlContent={request.html_content} 
                    fullscreenEmail={fullscreenEmail}
                    setFullscreenEmail={setFullscreenEmail}
                  />
                </TabsContent>

                <TabsContent value="attachments" className="h-full m-0">
                  <AttachmentsTab request={request} />
                </TabsContent>
              </div>
            </RequestDialogTabs>
          </div>

          <div className="p-3 border-t bg-background flex-shrink-0 h-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <RequestFormFields form={form} />
                <RequestFormActions 
                  trackingNumber={request.tracking_number}
                  isPending={isSubmitting}
                  onCancel={onCancel}
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
