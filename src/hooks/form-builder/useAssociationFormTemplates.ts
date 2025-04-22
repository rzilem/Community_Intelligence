
import { useSupabaseQuery } from '@/hooks/supabase';
import { FormTemplate, FormType } from '@/types/form-builder-types';

export function useAssociationFormTemplates(associationId?: string, formType?: FormType) {
  // First query: Get global forms
  const globalFormsQuery = useSupabaseQuery<FormTemplate[]>(
    'form_templates',
    {
      select: `
        id,
        name,
        description,
        form_type,
        is_global,
        fields,
        category,
        is_public,
        created_at,
        updated_at
      `,
      filter: [
        ...(formType ? [{ column: 'form_type', value: formType }] : []),
        { column: 'is_public', value: true, operator: 'eq' },
        { column: 'is_global', value: true, operator: 'eq' }
      ]
    },
    !!associationId // Only enabled if we have an association ID
  );

  // Second query: Get association-specific forms 
  const associationFormsQuery = useSupabaseQuery<FormTemplate[]>(
    'form_templates',
    {
      select: `
        id,
        name,
        description,
        form_type,
        is_global,
        fields,
        category,
        is_public,
        created_at,
        updated_at
      `,
      filter: [
        ...(formType ? [{ column: 'form_type', value: formType }] : []),
        { column: 'is_public', value: true, operator: 'eq' },
        { column: 'association_id', value: associationId, operator: 'eq' }
      ],
      order: { column: 'name', ascending: true }
    },
    !!associationId // Only enabled if we have an association ID
  );

  // Combine both results, prioritizing association-specific forms
  const isLoading = globalFormsQuery.isLoading || associationFormsQuery.isLoading;
  const error = globalFormsQuery.error || associationFormsQuery.error;
  
  const allForms = [
    ...(associationFormsQuery.data || []),
    ...(globalFormsQuery.data || [])
  ];

  return {
    data: allForms,
    isLoading,
    error
  };
}
