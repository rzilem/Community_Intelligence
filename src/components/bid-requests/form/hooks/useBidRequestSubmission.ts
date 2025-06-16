
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { createBidRequest } from '@/services/bid-requests/bid-request-api';
import { BidRequest } from '@/types/bid-request-types';
import { toast } from 'sonner';
import { BidRequestFormData } from '../../types/bid-request-form-types';

export const useBidRequestSubmission = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: BidRequestFormData, isDraft = false) => {
    if (!data.association_id) {
      toast.error('Please select an association');
      return;
    }

    if (!profile?.id) {
      toast.error('User profile not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const bidRequestData: Partial<BidRequest> = {
        ...data,
        created_by: profile.id,
        status: (isDraft ? 'draft' : 'published') as BidRequest['status'],
        bid_deadline: data.bid_deadline?.toISOString(),
        preferred_start_date: data.preferred_start_date?.toDateString(),
        required_completion_date: data.required_completion_date?.toDateString(),
      };

      const newBidRequest = await createBidRequest(bidRequestData);
      
      toast.success(
        isDraft 
          ? 'Bid request saved as draft successfully' 
          : 'Bid request published successfully'
      );
      
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('Error creating bid request:', error);
      toast.error('Failed to create bid request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit,
  };
};
