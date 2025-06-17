
import React, { useState } from 'react';
import PropertyTypeSection from '@/components/associations/PropertyTypeSection';
import { Association } from '@/types/association-types';
import { updateAssociation } from '@/services/association-service';
import { toast } from 'sonner';

interface PropertyTypeSettingsProps {
  association: Association;
  onUpdate: (updates: Partial<Association>) => void;
}

const PropertyTypeSettings: React.FC<PropertyTypeSettingsProps> = ({
  association,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditingValue(association.property_type || '');
  };

  const handleSaveEdit = async () => {
    if (!editingValue.trim()) return;
    
    setIsUpdating(true);
    try {
      await updateAssociation(association.id, { property_type: editingValue.trim() });
      onUpdate({ property_type: editingValue.trim() });
      setIsEditing(false);
      setEditingValue('');
      toast.success('Property type updated successfully');
    } catch (error) {
      console.error('Error updating property type:', error);
      toast.error('Failed to update property type');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingValue('');
  };

  return (
    <PropertyTypeSection
      association={association}
      isEditing={isEditing}
      editingValue={editingValue}
      onStartEdit={handleStartEdit}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onValueChange={setEditingValue}
      isUpdating={isUpdating}
    />
  );
};

export default PropertyTypeSettings;
