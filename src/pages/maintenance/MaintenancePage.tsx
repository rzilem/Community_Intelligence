
import React, { useState, useEffect } from 'react';
import { WrenchIcon, Plus, Filter, Search } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { useMaintenanceRequests } from '@/hooks/maintenance/useMaintenanceRequests';
import { MaintenanceRequestList } from '@/components/maintenance/MaintenanceRequestList';
import { MaintenanceRequestDialog } from '@/components/maintenance/MaintenanceRequestDialog';
import { MaintenanceRequest } from '@/types/maintenance-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import AssociationSelector from '@/components/associations/AssociationSelector';

const MaintenancePage: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [associationId, setAssociationId] = useState<string>(currentAssociation?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<MaintenanceRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const status = activeTab !== 'all' ? activeTab : undefined;
  
  const { 
    requests, 
    isLoading, 
    isSubmitting,
    createRequest,
    updateRequest,
    deleteRequest,
    refetchRequests
  } = useMaintenanceRequests({ 
    associationId,
    status,
    enabled: !!associationId
  });
  
  const { data: properties } = useSupabaseQuery(
    'properties',
    {
      select: 'id, address, unit_number',
      filter: [{ column: 'association_id', value: associationId }],
      order: { column: 'address', ascending: true }
    },
    !!associationId
  );

  const formattedProperties = properties ? properties.map(p => ({
    id: p.id,
    address: p.address + (p.unit_number ? ` Unit ${p.unit_number}` : '')
  })) : [];

  const filteredRequests = requests.filter(
    req => req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           req.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssociationChange = (id: string) => {
    setAssociationId(id);
  };

  const handleCreateRequest = () => {
    setCurrentRequest(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditRequest = (request: MaintenanceRequest) => {
    setCurrentRequest(request);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      await deleteRequest(id);
    }
  };

  const handleSubmit = async (data: Partial<MaintenanceRequest>) => {
    if (isEditing && currentRequest) {
      await updateRequest(currentRequest.id, data);
    } else {
      await createRequest({
        ...data,
        association_id: associationId
      });
    }
    setIsDialogOpen(false);
  };

  const getStatusCounts = () => {
    const counts = {
      all: requests.length,
      open: 0,
      in_progress: 0,
      closed: 0
    };
    
    requests.forEach(req => {
      if (counts[req.status as keyof typeof counts] !== undefined) {
        counts[req.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <PageTemplate 
      title="Maintenance Requests" 
      icon={<WrenchIcon className="h-8 w-8" />}
      description="Track and manage property maintenance requests"
    >
      <div className="mb-6">
        <AssociationSelector 
          onAssociationChange={handleAssociationChange}
          initialAssociationId={associationId}
          label="Select Association"
        />
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.open}</div>
              <p className="text-sm text-muted-foreground">Open Requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.in_progress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.closed}</div>
              <p className="text-sm text-muted-foreground">Closed Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-8 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCreateRequest}
                disabled={!associationId || formattedProperties.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {!associationId ? (
              <div className="text-center p-12 border rounded-md">
                <p className="text-muted-foreground">Please select an association to view maintenance requests</p>
              </div>
            ) : isLoading ? (
              <div className="text-center p-12 border rounded-md">
                <p className="text-muted-foreground">Loading maintenance requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center p-12 border rounded-md">
                <p className="text-muted-foreground">No maintenance requests found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateRequest}
                  disabled={formattedProperties.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Request
                </Button>
              </div>
            ) : (
              <MaintenanceRequestList
                requests={filteredRequests}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <MaintenanceRequestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        request={currentRequest}
        properties={formattedProperties}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />
    </PageTemplate>
  );
};

export default MaintenancePage;
