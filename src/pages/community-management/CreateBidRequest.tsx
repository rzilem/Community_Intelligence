
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTemplate from '@/components/layout/PageTemplate';
import { ClipboardList, Map, FileText, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Import step components
import BidRequestBasicInfo from '@/components/bid-requests/steps/BidRequestBasicInfo';
import BidRequestLocationMap from '@/components/bid-requests/steps/BidRequestLocationMap';
import BidRequestSpecifications from '@/components/bid-requests/steps/BidRequestSpecifications';
import BidRequestVendorSelection from '@/components/bid-requests/steps/BidRequestVendorSelection';
import BidRequestReview from '@/components/bid-requests/steps/BidRequestReview';

const STEPS = ['basic-info', 'location', 'specifications', 'vendors', 'review'];

const CreateBidRequest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('basic-info');
  const [formData, setFormData] = useState<Partial<BidRequestWithVendors>>({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    budget: undefined,
    visibility: 'private',
    imageUrl: '',
    attachments: [],
    specifications: {},
    locationData: { address: '', coordinates: null },
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user, profile } = useAuth();
  const associationId = profile?.activeAssociationId || '';
  const navigate = useNavigate();

  const handleStepUpdate = (stepData: Partial<BidRequestWithVendors>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
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

  const handleSubmit = async () => {
    try {
      if (!associationId) {
        toast.error("No active association selected");
        return;
      }

      const bidRequestData = {
        ...formData,
        associationId,
        createdBy: user?.id || '',
      };

      toast.loading("Creating bid request...");
      
      // First create the bid request
      const createdRequest = await bidRequestService.createBidRequest(bidRequestData);
      
      // If we have an image file, upload it
      if (imageFile) {
        await bidRequestService.uploadBidRequestImage(createdRequest.id, imageFile);
      }
      
      toast.dismiss();
      toast.success("Bid request created successfully");
      
      // Navigate back to the bid requests list
      navigate('/community-management/bid-requests');
    } catch (error) {
      toast.dismiss();
      toast.error("Error creating bid request");
      console.error('Error creating bid request:', error);
    }
  };

  return (
    <PageTemplate 
      title="Create New Bid Request" 
      icon={<ClipboardList className="h-8 w-8" />}
      description="Create a detailed specification for vendors to bid on your project."
    >
      <Card className="p-6">
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="basic-info" disabled={currentStep !== 'basic-info' && STEPS.indexOf(currentStep) < STEPS.indexOf('basic-info')}>
              1. Basic Info
            </TabsTrigger>
            <TabsTrigger value="location" disabled={currentStep !== 'location' && STEPS.indexOf(currentStep) < STEPS.indexOf('location')}>
              2. Location
            </TabsTrigger>
            <TabsTrigger value="specifications" disabled={currentStep !== 'specifications' && STEPS.indexOf(currentStep) < STEPS.indexOf('specifications')}>
              3. Specifications
            </TabsTrigger>
            <TabsTrigger value="vendors" disabled={currentStep !== 'vendors' && STEPS.indexOf(currentStep) < STEPS.indexOf('vendors')}>
              4. Vendors
            </TabsTrigger>
            <TabsTrigger value="review" disabled={currentStep !== 'review' && STEPS.indexOf(currentStep) < STEPS.indexOf('review')}>
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
            disabled={currentStep === STEPS[0]}
          >
            Previous
          </Button>
          
          {currentStep !== STEPS[STEPS.length - 1] ? (
            <Button onClick={goToNextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Submit Bid Request
            </Button>
          )}
        </div>
      </Card>
    </PageTemplate>
  );
};

export default CreateBidRequest;
