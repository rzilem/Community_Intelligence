
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { PropertyStep } from './steps/PropertyStep';
import { ContactStep } from './steps/ContactStep';
import { OrderDetailsStep } from './steps/OrderDetailsStep';
import { PaymentStep } from './steps/PaymentStep';
import { Property } from '@/types/property-types';

interface ResaleOrderStepsProps {
  currentStep: number;
  formData: any;
  setFormData: (data: any) => void;
  onPropertySelect: (property: Property | null) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ResaleOrderSteps = ({
  currentStep,
  formData,
  setFormData,
  onPropertySelect,
  onBack,
  onNext,
  onSubmit,
  isSubmitting
}: ResaleOrderStepsProps) => {
  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Form</CardTitle>
        <CardDescription>
          {currentStep === 1 && "Enter property information"}
          {currentStep === 2 && "Enter your contact details"}
          {currentStep === 3 && "Select rush options and closing date"}
          {currentStep === 4 && "Complete payment to finalize your order"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 1 && (
          <PropertyStep
            formData={formData}
            onPropertySelect={onPropertySelect}
          />
        )}
        {currentStep === 2 && (
          <ContactStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 3 && (
          <OrderDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}
        {currentStep === 4 && (
          <PaymentStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={onNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Place Order
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
