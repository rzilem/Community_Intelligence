
import React, { useState, useEffect } from 'react';
import { Network, Search, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageTemplate from '@/components/layout/PageTemplate';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useAssociations } from '@/hooks/associations';
import AssociationForm, { AssociationFormData } from '@/components/associations/AssociationForm';
import AssociationTable from '@/components/associations/AssociationTable';
import AssociationStats from '@/components/associations/AssociationStats';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const { 
    associations, 
    isLoading, 
    error,
    createAssociation,
    isCreating,
    manuallyRefresh 
  } = useAssociations();
  
  // Add debug logging for associations
  useEffect(() => {
    console.log('Current associations:', associations);
  }, [associations]);
  
  const handleSaveAssociation = async (formData: AssociationFormData) => {
    if (!formData.name) {
      toast.error('Association name is required');
      return;
    }
    
    try {
      console.log('Creating association with data:', formData);
      const associationData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        phone: formData.phone,
        contact_email: formData.email,
        property_type: formData.type,
        total_units: formData.units > 0 ? formData.units : undefined
      };
      
      await createAssociation(associationData);
      setIsDialogOpen(false);
      // Force immediate refresh
      setTimeout(manuallyRefresh, 1000);
    } catch (error: any) {
      console.error('Error saving association:', error);
      toast.error(`Failed to create association: ${error.message}`);
    }
  };
  
  const filteredAssociations = associations.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeAssociations = filteredAssociations.filter(a => !a.is_archived);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived);
  
  return (
    <PageTemplate 
      title="Associations" 
      icon={<Network className="h-8 w-8" />}
      description="Manage community associations and client organizations."
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search associations..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={manuallyRefresh}
                disabled={isLoading}
                title="Refresh association list"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Association
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Association</DialogTitle>
                    <DialogDescription>
                      Create a new community association or organization to manage.
                    </DialogDescription>
                  </DialogHeader>
                  <AssociationForm 
                    onClose={() => setIsDialogOpen(false)} 
                    onSave={handleSaveAssociation}
                    isSubmitting={isCreating}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem loading associations. Please try refreshing.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {filteredAssociations.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <span className="ml-1.5 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  {activeAssociations.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                <span className="ml-1.5 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                  {inactiveAssociations.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <AssociationTable associations={filteredAssociations} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="active">
              <AssociationTable associations={activeAssociations} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="inactive">
              <AssociationTable associations={inactiveAssociations} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AssociationStats associations={associations} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default Associations;
