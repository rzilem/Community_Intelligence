
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, Send, Loader2 } from 'lucide-react';
import BidRequestBasicInfoSection from './form/sections/BidRequestBasicInfoSection';
import BidRequestBudgetTimelineSection from './form/sections/BidRequestBudgetTimelineSection';
import BidRequestRequirementsSection from './form/sections/BidRequestRequirementsSection';
import { useBidRequestForm } from './form/hooks/useBidRequestForm';
import { useBidRequestSubmission } from './form/hooks/useBidRequestSubmission';

const BidRequestForm = () => {
  const navigate = useNavigate();
  const { form, handleAssociationChange } = useBidRequestForm();
  const { isSubmitting, onSubmit } = useBidRequestSubmission();

  const handleSaveDraft = () => {
    console.log('=== SAVING DRAFT ===');
    console.log('Current form values:', form.getValues());
    form.handleSubmit((data) => onSubmit(data, true))();
  };

  const handlePublish = () => {
    console.log('=== PUBLISHING ===');
    console.log('Current form values:', form.getValues());
    form.handleSubmit((data) => onSubmit(data, false))();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BidRequestBasicInfoSection 
        form={form}
        onAssociationChange={handleAssociationChange}
      />

      <BidRequestBudgetTimelineSection form={form} />

      <BidRequestRequirementsSection form={form} />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/community-management/bid-requests')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BidRequestForm;
