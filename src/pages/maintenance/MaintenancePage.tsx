
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceRequest } from '@/types/maintenance-types';
import { useMaintenanceRequests } from '@/hooks/maintenance/useMaintenanceRequests';
import MaintenanceRequestList from '@/components/maintenance/MaintenanceRequestList';
import MaintenanceRequestDialog from '@/components/maintenance/MaintenanceRequestDialog';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

const MaintenancePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const { currentAssociation } = useAuth();
  
  const {
    requests,
    isLoading,
    createRequest,
    updateRequest,
    deleteRequest
  } = useMaintenanceRequests(currentAssociation?.id);

  const handleOpenDialog = (request?: MaintenanceRequest) => {
    setSelectedRequest(request || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setIsDialogOpen(false);
  };

  const handleCreateRequest = async (requestData: Partial<MaintenanceRequest>) => {
    if (!currentAssociation?.id) {
      toast.error('No association selected');
      return;
    }
    
    if (!requestData.property_id) {
      toast.error('Property is required');
      return;
    }
    
    const result = await createRequest({
      title: requestData.title || '',
      description: requestData.description || '',
      property_id: requestData.property_id,
      priority: requestData.priority || 'medium',
      status: requestData.status || 'open',
      assigned_to: requestData.assigned_to,
      association_id: currentAssociation.id
    });
    
    if (result) {
      handleCloseDialog();
    }
  };

  const handleUpdateRequest = async (requestData: Partial<MaintenanceRequest>) => {
    if (!selectedRequest?.id) return;
    
    const result = await updateRequest(selectedRequest.id, requestData);
    
    if (result) {
      handleCloseDialog();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      await deleteRequest(id);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceRequestList
              requests={requests}
              isLoading={isLoading}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteRequest}
            />
          </CardContent>
        </Card>

        <MaintenanceRequestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          request={selectedRequest}
          onSubmit={selectedRequest ? handleUpdateRequest : handleCreateRequest}
        />
      </div>
    </AppLayout>
  );
};

export default MaintenancePage;
