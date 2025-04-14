
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { bidRequestService } from '@/services/bid-request-service';
import { BidRequestWithVendors, BidRequestVendor } from '@/types/bid-request-types';
import { Vendor } from '@/types/vendor-types';

// Import our new components
import BidRequestBasicFields from './form/BidRequestBasicFields';
import BidRequestImageUpload from './form/BidRequestImageUpload';
import BidRequestVendorSelector from './form/BidRequestVendorSelector';

interface BidRequestFormProps {
  onSubmit: (bidRequest: Partial<BidRequestWithVendors>) => void;
  initialData?: Partial<BidRequestWithVendors>;
}

const BidRequestForm: React.FC<BidRequestFormProps> = ({ onSubmit, initialData }) => {
  const [eligibleVendors, setEligibleVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<Partial<BidRequestWithVendors>>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'draft',
      budget: initialData?.budget || undefined,
      category: initialData?.category || '',
      visibility: initialData?.visibility || 'private',
      dueDate: initialData?.dueDate || '',
    }
  });

  useEffect(() => {
    const fetchEligibleVendors = async () => {
      try {
        const vendors = await bidRequestService.filterEligibleVendors('');
        setEligibleVendors(vendors);
      } catch (error) {
        console.error('Error fetching eligible vendors:', error);
      }
    };

    fetchEligibleVendors();
  }, []);

  const handleFormSubmit = async (data: Partial<BidRequestWithVendors>) => {
    try {
      // If an image was uploaded, prepare for upload
      let imageUrl;
      if (imageFile) {
        // We'll handle the actual upload after creating the bid request
        // Just noting we have an image to upload
        imageUrl = 'pending_upload';
      }

      // Prepare the vendors array with the required properties
      const vendors = selectedVendors.map(vendorId => ({
        vendorId,
        status: 'invited' as const,
      } as BidRequestVendor));

      // Prepare the bid request data
      const bidRequestData: Partial<BidRequestWithVendors> = {
        ...data,
        imageUrl,
        vendors
      };

      // Submit the bid request
      onSubmit(bidRequestData);
    } catch (error) {
      console.error('Error submitting bid request:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic fields component */}
        <BidRequestBasicFields form={form} />
        
        {/* Image upload component */}
        <BidRequestImageUpload onFileSelect={setImageFile} />
        
        {/* Vendor selector component */}
        <BidRequestVendorSelector 
          eligibleVendors={eligibleVendors}
          selectedVendors={selectedVendors}
          onVendorsChange={setSelectedVendors}
        />

        <Button type="submit" className="w-full">
          Create Bid Request
        </Button>
      </form>
    </Form>
  );
};

export default BidRequestForm;
