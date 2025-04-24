
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const ResaleOrderProcess = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyAddress: '',
    orderType: 'Resale Certificate',
    priority: 'Regular',
  });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/resale-portal/my-orders');
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form and navigate
      navigate('/resale-portal/my-orders');
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Property</h2>
            <p className="text-muted-foreground">
              Please select the property for which you need documents.
            </p>
            <div className="rounded-md border p-4 bg-muted/30">
              <p className="text-center py-8">
                Property selection form would go here. This is a placeholder.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Documents</h2>
            <p className="text-muted-foreground">
              Choose the documents you need for your transaction.
            </p>
            <div className="rounded-md border p-4 bg-muted/30">
              <p className="text-center py-8">
                Document selection options would go here. This is a placeholder.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-muted-foreground">
              Provide additional information about your order.
            </p>
            <div className="rounded-md border p-4 bg-muted/30">
              <p className="text-center py-8">
                Order details form would go here. This is a placeholder.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review & Submit</h2>
            <p className="text-muted-foreground">
              Please review your order information before submitting.
            </p>
            <div className="rounded-md border p-4 bg-muted/30 space-y-4">
              <div>
                <h3 className="font-medium">Property Address</h3>
                <p>123 Main Street, Apt 4B, Anytown, TX 75001</p>
              </div>
              <div>
                <h3 className="font-medium">Order Type</h3>
                <p>Resale Certificate</p>
              </div>
              <div>
                <h3 className="font-medium">Priority</h3>
                <p>Regular</p>
              </div>
              <div>
                <h3 className="font-medium">Estimated Completion</h3>
                <p>3-5 business days</p>
              </div>
              <div>
                <h3 className="font-medium">Total Cost</h3>
                <p className="font-bold">$250.00</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <PageTemplate
      title="Request Resale Documents"
      icon={<FileText className="h-8 w-8" />}
      description="Order resale certificates, questionnaires, and other documents"
      backLink="/resale-portal/my-orders"
    >
      <Card>
        <CardContent className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`flex flex-col items-center ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <div 
                    className={`rounded-full w-10 h-10 flex items-center justify-center mb-2 ${
                      currentStep > step 
                        ? 'bg-primary text-white' 
                        : currentStep === step 
                          ? 'border-2 border-primary text-primary' 
                          : 'border-2 border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className="text-xs">
                    {step === 1 
                      ? 'Property' 
                      : step === 2 
                        ? 'Documents' 
                        : step === 3 
                          ? 'Details' 
                          : 'Review'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="relative mt-2">
              <div className="absolute top-0 left-5 right-5 h-1 bg-muted-foreground/20"></div>
              <div 
                className="absolute top-0 left-5 h-1 bg-primary transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {renderContent()}

          <div className="mt-8 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={handleNext}
            >
              {currentStep < 4 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Submit Order
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default ResaleOrderProcess;
