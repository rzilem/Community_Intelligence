import React, { useState, useEffect } from 'react';
import { Network, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/auth';
import { useAssociationQueries, useAssociationMutations } from '@/hooks/associations';
import AssociationStats from '@/components/associations/AssociationStats';
import PageTemplate from '@/components/layout/PageTemplate';
import AssociationToolbar from '@/components/associations/AssociationToolbar';
import AssociationTabs from '@/components/associations/AssociationTabs';
import { AssociationFormData } from '@/components/associations/AssociationForm';
import { Association } from '@/types/association-types';
import { useNavigate } from 'react-router-dom';

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    associations, 
    isLoading, 
    error,
    manuallyRefresh 
  } = useAssociationQueries();

  const { 
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting
  } = useAssociationMutations();
  
  // Ensure associations is an array
  const associationsArray = Array.isArray(associations) ? associations : [];
  
  const filteredAssociations = associationsArray.filter(
    association => association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (association.address && association.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeAssociations = filteredAssociations.filter(a => !a.is_archived);
  const inactiveAssociations = filteredAssociations.filter(a => a.is_archived);
  
  // Handle saving a new association
  const handleSaveAssociation = (data: AssociationFormData) => {
    // Map form data to the expected Association format
    const newAssociation = {
      name: data.name, // Ensure name is provided as a required field
      property_type: data.type,
      total_units: data.units,
      city: data.city,
      state: data.state,
      address: data.address,
      zip: data.zipCode,
      phone: data.phone,
      contact_email: data.email
    };
    
    createAssociation(newAssociation);
    toast.success(`Association "${data.name}" created successfully`);
  };
  
  // Handle editing an existing association
  const handleEditAssociation = (id: string, data: Partial<Association>) => {
    updateAssociation({ id, data });
  };
  
  // Handle deleting an association
  const handleDeleteAssociation = (id: string) => {
    deleteAssociation(id);
  };
  
  const getAssociationStatusBadge = (isArchived: boolean) => (
    <Badge 
      variant={isArchived ? "outline" : "default"}
      className={isArchived ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"}
    >
      {isArchived ? "Inactive" : "Active"}
    </Badge>
  );
  
  return (
    <PageTemplate 
      title="Associations" 
      icon={<Network className="h-8 w-8" />}
      description="Manage community associations and client organizations."
      actions={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={manuallyRefresh}
                disabled={isLoading}
                className="hover:scale-105 transition-transform duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh associations list</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search associations (Ctrl + /)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <AssociationToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRefresh={manuallyRefresh}
              isLoading={isLoading}
              isCreating={isCreating}
              onSaveAssociation={handleSaveAssociation}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">
                <AlertCircle className="inline-block mr-2 h-5 w-5" />
                {error.message || "An error occurred while loading associations"}
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 bg-muted w-full rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredAssociations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md">
              <Network className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No associations found</p>
              <Button className="mt-4">Create First Association</Button>
            </div>
          ) : (
            <AssociationTabs
              error={error}
              filteredAssociations={filteredAssociations}
              activeAssociations={activeAssociations}
              inactiveAssociations={inactiveAssociations}
              isLoading={isLoading}
              onEdit={handleEditAssociation}
              onDelete={handleDeleteAssociation}
            />
          )}
        </CardContent>
      </Card>
      
      <AssociationStats associations={associationsArray} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default Associations;
