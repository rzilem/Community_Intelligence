
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { PropertyStep } from './steps/PropertyStep';
import { ContactStep } from './steps/ContactStep';
import { OrderDetailsStep } from './steps/OrderDetailsStep';
import { PaymentStep } from './steps/PaymentStep';
import { Property } from '@/types/property-types';
import { useResaleOrderForm, ResaleOrderFormData } from '@/hooks/resale/useResaleOrderForm';

interface ResaleOrderStepsProps {
  currentStep: number;
  onPropertySelect: (property: Property | null) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ResaleOrderSteps = ({
  currentStep,
  onPropertySelect,
  onBack,
  onNext,
  onSubmit,
  isSubmitting
}: ResaleOrderStepsProps) => {
  const { form } = useResaleOrderForm();
  
  const handleNextClick = async () => {
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields);
    if (isValid) {
      onNext();
    }
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
            onPropertySelect={onPropertySelect}
            form={form}
          />
        )}
        {currentStep === 2 && (
          <ContactStep
            form={form}
          />
        )}
        {currentStep === 3 && (
          <OrderDetailsStep
            form={form}
          />
        )}
        {currentStep === 4 && (
          <PaymentStep
            form={form}
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
          <Button 
            onClick={handleNextClick}
            disabled={isSubmitting}
          >
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

function getStepFields(step: number): (keyof ResaleOrderFormData)[] {
  switch (step) {
    case 1:
      return ['propertyInfo'];
    case 2:
      return ['contactInfo'];
    case 3:
      return ['orderDetails'];
    case 4:
      return ['payment'];
    default:
      return [];
  }
}
