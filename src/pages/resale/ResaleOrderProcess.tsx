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

const ResaleOrderProcess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderTypeId = searchParams.get('type') || 'resale-cert';
  const orderType = orderTypes[orderTypeId as keyof typeof orderTypes];
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyInfo: {
      address: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      community: '',
      propertyType: 'condo',
      propertyId: null as string | null,
      associationId: null as string | null
    },
    contactInfo: {
      role: 'title-company',
      name: '',
      email: '',
      phone: '',
      company: '',
    },
    orderDetails: {
      rushOption: 'standard',
      closingDate: '',
      additionalNotes: '',
    },
    payment: {
      cardName: '',
      cardNumber: '',
      expiration: '',
      cvv: '',
      billingZip: '',
    }
  });

  const handlePropertySelect = (property: Property | null) => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        propertyInfo: {
          ...prev.propertyInfo,
          address: property.address,
          unit: property.unit_number || '',
          city: property.city || '',
          state: property.state || '',
          zip: property.zip || '',
          propertyId: property.id,
          associationId: property.association_id
        }
      }));
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
    if (currentStep === 1 && !formData.propertyInfo.propertyId) {
      toast.error("Please select a valid property from the database");
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast.success("Order Submitted Successfully");
      setIsSubmitting(false);
      navigate('/resale-portal/my-orders');
    }, 2000);
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
            formData={formData}
            setFormData={setFormData}
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
            formData={formData}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default ResaleOrderProcess;
