
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResaleOrderSteps } from '@/components/resale/order-process/ResaleOrderSteps';
import { ResaleOrderSummary } from '@/components/resale/order-process/ResaleOrderSummary';
import { Property } from '@/types/property-types';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orderTypes } from '@/components/resale/order-process/types/resale-order-types';
import { toast } from 'sonner';
import { useResaleOrderForm } from '@/hooks/resale/useResaleOrderForm';

const ResaleOrderProcess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderTypeId = searchParams.get('type') || 'resale-cert';
  const orderType = orderTypes[orderTypeId as keyof typeof orderTypes];
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { form, onSubmit } = useResaleOrderForm();

  const handlePropertySelect = (property: Property | null) => {
    if (property) {
      form.setValue('propertyInfo', {
        address: property.address,
        unit: property.unit_number || '',
        city: property.city || '',
        state: property.state || '',
        zip: property.zip || '',
        propertyId: property.id,
        associationId: property.association_id,
      });
    } else {
      toast.error("Please select a valid property from the database.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/resale-portal');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !form.getValues('propertyInfo.propertyId')) {
      toast.error("Please select a valid property from the database");
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <PageTemplate 
      title={`Order ${orderType.title}`}
      icon={<FileText className="h-8 w-8" />}
      description="Complete the form below to place your order"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResaleOrderSteps 
            currentStep={currentStep}
            onPropertySelect={handlePropertySelect}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ResaleOrderSummary 
            orderType={orderType}
            formData={form.getValues()}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default ResaleOrderProcess;
