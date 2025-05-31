
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FormStepOne from './FormStepOne';
import FormStepTwo from './FormStepTwo';
import FormStepThree from './FormStepThree';
import { ProposalRequestFormData, submitProposalRequest } from '@/types/proposal-request-types';

// Define validation schema
const proposalRequestSchema = z.object({
  communityName: z.string().min(1, 'Community Name is required'),
  numberOfBids: z.string().min(1, 'Number of Bids is required'),
  address: z.object({
    streetAddress: z.string().min(1, 'Street Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().min(1, 'ZIP Code is required')
  }),
  projectType: z.string().min(1, 'Project Type is required'),
  bidRequestType: z.string().optional(),
  workLocation: z.string().optional(),
  cpaService: z.string().optional(),
  roadWorkTypes: z.array(z.string()).optional(),
  fenceLocation: z.string().optional(),
  additionalDetails: z.string().optional()
});

const ProposalRequestForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProposalRequestFormData>({
    communityName: '',
    numberOfBids: '',
    address: {
      streetAddress: '',
      addressLine2: '',
      city: '',
      zipCode: ''
    },
    projectType: '',
    bidRequestType: '',
    workLocation: '',
    cpaService: '',
    roadWorkTypes: [],
    fenceLocation: '',
    additionalDetails: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleSubmit: formHandleSubmit } = useForm<ProposalRequestFormData>({
    resolver: zodResolver(proposalRequestSchema),
    defaultValues: formData
  });

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const updatedData = { ...prev };
        if (parent === 'address') {
          updatedData.address = {
            ...prev.address,
            [child]: value
          };
        }
        return updatedData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.communityName) {
        newErrors.communityName = 'Community Name is required';
      }
      if (!formData.numberOfBids) {
        newErrors.numberOfBids = 'Number of Bids is required';
      }
      if (!formData.address.streetAddress) {
        newErrors['address.streetAddress'] = 'Street Address is required';
      }
      if (!formData.address.city) {
        newErrors['address.city'] = 'City is required';
      }
      if (!formData.address.zipCode) {
        newErrors['address.zipCode'] = 'ZIP Code is required';
      }
    } else if (stepNumber === 2) {
      if (!formData.projectType) {
        newErrors.projectType = 'Project Type is required';
      }
    } else if (stepNumber === 3) {
      if (['Electrician', 'HVAC', 'Painting', 'Pest Control', 'Plumbing', 'Locksmith', 'Power Washing', 'Leak Detection', 'Construction (Big Projects)'].includes(formData.projectType) && !formData.workLocation) {
        newErrors.workLocation = 'Location of the Work is required';
      }
      if (formData.projectType === 'Street Repairs / Paving / Striping' && (!formData.roadWorkTypes || formData.roadWorkTypes.length === 0)) {
        newErrors.roadWorkTypes = 'At least one type of road work is required';
      }
      if (formData.projectType === 'Fencing' && !formData.fenceLocation) {
        newErrors.fenceLocation = 'Location of Fence is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const onSubmit: SubmitHandler<ProposalRequestFormData> = async (data) => {
    if (!validateStep(step)) {
      return;
    }
    
    if (!user?.id) {
      toast.error('You must be logged in to submit a proposal request');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: result, error } = await submitProposalRequest(formData, user.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Proposal request submitted successfully');
      // Reset form
      setFormData({
        communityName: '',
        numberOfBids: '',
        address: {
          streetAddress: '',
          addressLine2: '',
          city: '',
          zipCode: ''
        },
        projectType: '',
        bidRequestType: '',
        workLocation: '',
        cpaService: '',
        roadWorkTypes: [],
        fenceLocation: '',
        additionalDetails: ''
      });
      setStep(1);
    } catch (error) {
      console.error('Error submitting proposal request:', error);
      toast.error('Failed to submit proposal request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div 
        className="bg-gradient-to-r from-blue-900 to-gray-400 p-6 rounded-t-lg"
      >
        <h2 className="text-white text-2xl font-bold">Management Proposal Request</h2>
        <p className="text-white mt-2">Step {step} of 3</p>
      </div>
      
      <Card className="rounded-t-none p-6">
        <form onSubmit={formHandleSubmit(onSubmit)}>
          {step === 1 && (
            <FormStepOne 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
            />
          )}
          
          {step === 2 && (
            <FormStepTwo 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
            />
          )}
          
          {step === 3 && (
            <FormStepThree 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
            />
          )}
          
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button 
                type="button"
                variant="outline" 
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button 
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProposalRequestForm;
