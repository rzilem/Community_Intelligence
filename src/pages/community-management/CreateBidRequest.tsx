import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList, Map, FileText, SendHorizontal, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Import step components
import BidRequestBasicInfo from '@/components/bid-requests/steps/BidRequestBasicInfo';
import BidRequestLocationMap from '@/components/bid-requests/steps/BidRequestLocationMap';
import BidRequestSpecifications from '@/components/bid-requests/steps/BidRequestSpecifications';
import BidRequestVendorSelection from '@/components/bid-requests/steps/BidRequestVendorSelection';
import BidRequestReview from '@/components/bid-requests/steps/BidRequestReview';

const STEPS = ['basic-info', 'location', 'specifications', 'vendors', 'review'];

const CreateBidRequest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [formId, setFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BidRequestWithVendors>>({
    title: '',
    description: '',
    category: '',
    status: 'draft' as const,
    visibility: 'private' as const,
    imageUrl: '',
    attachments: [],
    specifications: {},
    locationData: { address: '', coordinates: null },
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, profile, currentAssociation } = useAuth();
  const associationId = currentAssociation?.id || '';
  const navigate = useNavigate();

  // Auto-save draft every 30 seconds if modified
  useEffect(() => {
    if (!isFormModified) return;
    
    const timer = setTimeout(() => {
      handleSaveDraft();
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [formData, isFormModified]);

  const handleStepUpdate = (stepData: Partial<BidRequestWithVendors>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setIsFormModified(true);
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (!associationId) {
        toast.error("No active association selected");
        return;
      }

      const bidRequestData = {
        ...formData,
        associationId,
        createdBy: user?.id || '',
        status: formData.status as "draft" | "open" | "closed" | "awarded"
      };
      
      if (formId) {
        // Update existing draft
        await bidRequestService.updateBidRequest(formId, bidRequestData);
        toast.success("Draft saved successfully");
      } else {
        // Create new draft
        const createdRequest = await bidRequestService.createBidRequest(bidRequestData);
        setFormId(createdRequest.id);
        toast.success("Draft created successfully");
      }
      
      setIsFormModified(false);
    } catch (error) {
      toast.error("Error saving draft");
      console.error('Error saving draft:', error);
    }
  };

  const handleCancel = () => {
    if (isFormModified) {
      setShowCancelDialog(true);
    } else {
      navigate('/bid-requests');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!associationId) {
        toast.error("No active association selected");
        return;
      }

      setIsSubmitting(true);
      
      const bidRequestData = {
        ...formData,
        associationId,
        createdBy: user?.id || '',
        status: 'open' as const,
      };
      
      // First create or update the bid request
      let requestId = formId;
      
      if (requestId) {
        await bidRequestService.updateBidRequest(requestId, bidRequestData);
      } else {
        const createdRequest = await bidRequestService.createBidRequest(bidRequestData);
        requestId = createdRequest.id;
      }
      
      // If we have an image file, upload it
      if (imageFile && requestId) {
        await bidRequestService.uploadBidRequestImage(requestId, imageFile);
      }
      
      toast.success("Bid request submitted successfully");
      
      // Navigate back to the bid requests list
      navigate('/bid-requests');
    } catch (error) {
      toast.error("Error submitting bid request");
      console.error('Error submitting bid request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: string): boolean => {
    switch (step) {
      case 'basic-info':
        return Boolean(formData.title && formData.description && formData.category);
      case 'location':
        return Boolean(formData.locationData?.address);
      case 'specifications':
        return Boolean(formData.specifications?.projectGoals && formData.dueDate);
      case 'vendors':
        return Boolean(formData.vendors && formData.vendors.length > 0);
      default:
        return true;
    }
  };

  return (
    <PageTemplate 
      title="Create New Bid Request" 
      icon={<ClipboardList className="h-8 w-8" />}
      description="Create a detailed specification for vendors to bid on your project."
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-muted-foreground">
            {formId ? 'Draft saved' : 'New bid request'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={!isFormModified || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger 
              value="basic-info" 
              disabled={currentStep !== 'basic-info' && STEPS.indexOf(currentStep) < STEPS.indexOf('basic-info')}
              className={isStepValid('basic-info') ? "border-green-500" : ""}
            >
              1. Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="location" 
              disabled={currentStep !== 'location' && STEPS.indexOf(currentStep) < STEPS.indexOf('location')}
              className={isStepValid('location') ? "border-green-500" : ""}
            >
              2. Location
            </TabsTrigger>
            <TabsTrigger 
              value="specifications" 
              disabled={currentStep !== 'specifications' && STEPS.indexOf(currentStep) < STEPS.indexOf('specifications')}
              className={isStepValid('specifications') ? "border-green-500" : ""}
            >
              3. Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="vendors" 
              disabled={currentStep !== 'vendors' && STEPS.indexOf(currentStep) < STEPS.indexOf('vendors')}
              className={isStepValid('vendors') ? "border-green-500" : ""}
            >
              4. Vendors
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={currentStep !== 'review' && STEPS.indexOf(currentStep) < STEPS.indexOf('review')}
            >
              5. Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info">
            <BidRequestBasicInfo 
              formData={formData} 
              onUpdate={handleStepUpdate}
              onImageSelect={setImageFile}
            />
          </TabsContent>

          <TabsContent value="location">
            <BidRequestLocationMap 
              formData={formData} 
              onUpdate={handleStepUpdate} 
            />
          </TabsContent>

          <TabsContent value="specifications">
            <BidRequestSpecifications 
              formData={formData} 
              onUpdate={handleStepUpdate}
            />
          </TabsContent>

          <TabsContent value="vendors">
            <BidRequestVendorSelection 
              formData={formData} 
              onUpdate={handleStepUpdate}
            />
          </TabsContent>

          <TabsContent value="review">
            <BidRequestReview 
              formData={formData}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={currentStep === STEPS[0] || isSubmitting}
          >
            Previous
          </Button>
          
          {currentStep !== STEPS[STEPS.length - 1] ? (
            <Button 
              onClick={goToNextStep}
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <SendHorizontal className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Bid Request'}
            </Button>
          )}
        </div>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel bid request?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save a draft before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await handleSaveDraft();
                navigate('/bid-requests');
              }}
            >
              Save Draft
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => navigate('/bid-requests')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
};

export default CreateBidRequest;
