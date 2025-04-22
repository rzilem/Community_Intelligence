
import { useState } from 'react';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseDelete } from '@/hooks/supabase';
import { FormTemplate, FormTemplateAssociation } from '@/types/form-builder-types';
import { toast } from 'sonner';

export function useFormAssociations(formId: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: associations = [], isLoading } = useSupabaseQuery<FormTemplateAssociation[]>(
    'form_template_associations',
    {
      select: '*',
      filter: [{ column: 'form_template_id', value: formId }]
    }
  );

  const { mutate: createAssociation } = useSupabaseCreate('form_template_associations');
  const { mutate: deleteAssociation } = useSupabaseDelete('form_template_associations');

  const updateAssociations = async (associationIds: string[]) => {
    setIsUpdating(true);
    try {
      // Remove existing associations
      for (const assoc of associations) {
        if (!associationIds.includes(assoc.association_id)) {
          await deleteAssociation(assoc.id);
        }
      }

      // Add new associations
      const existingIds = associations.map(a => a.association_id);
      for (const id of associationIds) {
        if (!existingIds.includes(id)) {
          await createAssociation({
            form_template_id: formId,
            association_id: id
          });
        }
      }

      toast.success('Form associations updated successfully');
    } catch (error) {
      console.error('Error updating form associations:', error);
      toast.error('Failed to update form associations');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    associations,
    isLoading,
    isUpdating,
    updateAssociations
  };
}
