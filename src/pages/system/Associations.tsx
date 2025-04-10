
import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useAssociations } from '@/hooks/associations';
import AssociationStats from '@/components/associations/AssociationStats';
import PageTemplate from '@/components/layout/PageTemplate';
import AssociationToolbar from '@/components/associations/AssociationToolbar';
import AssociationTabs from '@/components/associations/AssociationTabs';
import { supabase } from '@/integrations/supabase/client';
import { AssociationFormData } from '@/components/associations/AssociationForm';
import { Association } from '@/types/association-types';

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  const { 
    associations, 
    isLoading, 
    error,
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting,
    manuallyRefresh 
  } = useAssociations();
  
  // Add debug logging for associations
  useEffect(() => {
    console.log('Current associations:', associations);
  }, [associations]);
  
  // Check for authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('You must be logged in to view associations');
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSaveAssociation = async (formData: AssociationFormData) => {
    if (!formData.name) {
      toast.error('Association name is required');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to create an association');
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
        total_units: formData.units ? Number(formData.units) : undefined
      };
      
      await createAssociation(associationData);
      
      // Force immediate refresh
      setTimeout(() => {
        manuallyRefresh();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving association:', error);
      toast.error(`Failed to create association: ${error.message}`);
    }
  };
  
  const handleEditAssociation = async (id: string, data: Partial<Association>) => {
    try {
      await updateAssociation({ id, data });
      toast.success('Association updated successfully');
      manuallyRefresh();
    } catch (error: any) {
      console.error('Error updating association:', error);
      toast.error(`Failed to update association: ${error.message}`);
    }
  };
  
  const handleDeleteAssociation = async (id: string) => {
    try {
      await deleteAssociation(id);
      toast.success('Association deleted successfully');
      manuallyRefresh();
    } catch (error: any) {
      console.error('Error deleting association:', error);
      toast.error(`Failed to delete association: ${error.message}`);
    }
  };
  
  // Ensure associations is treated as an array
  const associationsArray = Array.isArray(associations) ? associations : [];
  
  const filteredAssociations = associationsArray.filter(
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
          <AssociationToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={manuallyRefresh}
            isLoading={isLoading}
            isCreating={isCreating}
            onSaveAssociation={handleSaveAssociation}
          />
          
          <AssociationTabs
            error={error}
            filteredAssociations={filteredAssociations}
            activeAssociations={activeAssociations}
            inactiveAssociations={inactiveAssociations}
            isLoading={isLoading}
            onEdit={handleEditAssociation}
            onDelete={handleDeleteAssociation}
          />
        </CardContent>
      </Card>
      
      <AssociationStats associations={associationsArray} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default Associations;
