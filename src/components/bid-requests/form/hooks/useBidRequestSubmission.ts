
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
    console.log('=== BID REQUEST SUBMISSION DEBUG ===');
    console.log('Form data received:', data);
    console.log('User profile:', profile);
    
    // Validation checks
    if (!data.association_id) {
      console.error('Missing association_id');
      toast.error('Please select an association');
      return;
    }

    if (!profile?.id) {
      console.error('Missing user profile');
      toast.error('User profile not found');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data with proper formatting
      const bidRequestData: Partial<BidRequest> = {
        association_id: data.association_id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        location: data.location,
        special_requirements: data.special_requirements,
        budget_range_min: data.budget_range_min,
        budget_range_max: data.budget_range_max,
        created_by: profile.id,
        status: (isDraft ? 'draft' : 'published') as BidRequest['status'],
        // Convert dates to proper format - using ISO strings for consistency
        preferred_start_date: data.preferred_start_date ? data.preferred_start_date.toISOString().split('T')[0] : undefined,
        required_completion_date: data.required_completion_date ? data.required_completion_date.toISOString().split('T')[0] : undefined,
        bid_deadline: data.bid_deadline ? data.bid_deadline.toISOString() : undefined,
      };

      console.log('Prepared bid request data:', bidRequestData);

      const newBidRequest = await createBidRequest(bidRequestData);
      
      console.log('Created bid request:', newBidRequest);
      
      toast.success(
        isDraft 
          ? 'Bid request saved as draft successfully' 
          : 'Bid request published successfully'
      );
      
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('=== BID REQUEST SUBMISSION ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // More specific error handling
      let errorMessage = 'Failed to create bid request';
      if (error instanceof Error) {
        if (error.message.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your association access.';
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Invalid data format. Please check your input values.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'A bid request with this information already exists.';
        } else {
          errorMessage = `Failed to create bid request: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit,
  };
};
