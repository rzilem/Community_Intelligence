
import React from 'react';
import { Building2 } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import PropertyTypeManager from '@/components/associations/PropertyTypeManager';
import { useAssociations } from '@/hooks/associations/useAssociations';
import { updateAssociation } from '@/services/association-service';
import { toast } from 'sonner';

const AssociationPropertyTypes = () => {
  const { associations, isLoading, isUpdating } = useAssociations();
  
  const handleUpdatePropertyType = async (id: string, propertyType: string) => {
    try {
      await updateAssociation(id, { property_type: propertyType });
      toast.success('Property type updated successfully');
    } catch (error) {
      console.error('Error updating property type:', error);
      toast.error('Failed to update property type');
    }
  };

  return (
    <PageTemplate 
      title="Property Type Management" 
      icon={<Building2 className="h-8 w-8" />}
      description="Configure property types for associations to enable smart data import mapping."
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading associations...</p>
          </div>
        </div>
      ) : (
        <PropertyTypeManager
          associations={associations}
          onUpdatePropertyType={handleUpdatePropertyType}
          isUpdating={isUpdating}
        />
      )}
    </PageTemplate>
  );
};

export default AssociationPropertyTypes;
