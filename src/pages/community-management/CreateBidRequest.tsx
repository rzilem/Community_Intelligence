
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { bidRequestService } from '@/services/bidRequestService';
import { BidRequestFormData } from '@/types/bid-request-form-types';
import { useAuth } from '@/contexts/AuthContext';
import AssociationSelector from '@/components/associations/AssociationSelector';
import BidRequestForm from '@/components/bid-requests/BidRequestForm';

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>(
    profile?.association_id || ''
  );

  // Check if user is admin or manager
  const isAdminOrManager = profile?.role === 'admin' || profile?.role === 'manager';
  
  // Determine which association ID to use
  const effectiveAssociationId = isAdminOrManager ? selectedAssociationId : profile?.association_id;
  
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
        hoa_id: effectiveAssociationId || '',
        association_id: effectiveAssociationId || '',
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
      const bidRequest = await bidRequestService.createBidRequest({
        ...data,
        hoa_id: effectiveAssociationId || '',
        association_id: effectiveAssociationId || '',
        status: 'draft'
      });
      toast.success('Draft saved successfully');
      navigate('/community-management/bid-requests');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  // Show association selector for admins/managers, or error for users without association
  const renderContent = () => {
    if (isAdminOrManager) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Community</CardTitle>
              <CardDescription>
                Choose which community this bid request is for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssociationSelector
                onAssociationChange={handleAssociationChange}
                initialAssociationId={selectedAssociationId}
                label="Community"
              />
            </CardContent>
          </Card>

          {effectiveAssociationId && (
            <BidRequestForm
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              hoaId={effectiveAssociationId}
              currentUserId={user?.id || ''}
            />
          )}

          {!effectiveAssociationId && (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  Please select a community to create a bid request.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // For regular users, check if they have an association
    if (profile?.association_id) {
      return (
        <BidRequestForm
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          hoaId={profile.association_id}
          currentUserId={user?.id || ''}
        />
      );
    }

    // Regular users without association
    return (
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
    );
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

      {renderContent()}
    </div>
  );
};

export default CreateBidRequest;
