import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { bidRequestService } from '@/services/bidRequestService';
import { BidRequestFormData } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (data: BidRequestFormData) => {
    try {
      const specifications = {
        timeline: data.project_details?.timeline,
        budget: data.budget_range_max,
        requirements: data.special_requirements,
        deliverables: data.project_details?.deliverables,
        materialRequirements: data.project_details?.materialRequirements,
        timelineExpectations: data.project_details?.timelineExpectations,
        specialNotes: data.project_details?.specialNotes
      };

      const bidRequest = await bidRequestService.createBidRequest({
        ...data,
        specifications
      });
      
      toast.success('Bid request created successfully');
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('Error creating bid request:', error);
      toast.error('Failed to create bid request');
    }
  };

  const handleSaveDraft = async (data: BidRequestFormData) => {
    try {
      setLoading(true);
      const bidRequest = await bidRequestService.createBidRequest(data);
      toast.success('Draft saved successfully');
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/community-management/bid-requests')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Bid Request</h1>
            <p className="text-muted-foreground">
              Create a new request for vendor bids
            </p>
          </div>
        </div>
      </div>

      {profile?.association_id ? (
        <bidRequestService.BidRequestForm
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          hoaId={profile.association_id}
          currentUserId={user?.id || ''}
        />
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              You need to be associated with a community to create bid requests.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateBidRequest;
