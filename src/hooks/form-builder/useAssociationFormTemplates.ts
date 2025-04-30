
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
        fields
      `,
      filter: [
        ...(formType ? [{ column: 'form_type', value: formType }] : []),
        { column: 'is_public', value: true },
        { column: 'is_global', value: true }
      ]
    },
    !!associationId // Only enabled if we have an association ID
  );

  // Second query: Get association-specific forms via the join table
  const associationFormsQuery = useSupabaseQuery<FormTemplate[]>(
    'form_templates',
    {
      select: `
        form_templates.id,
        form_templates.name,
        form_templates.description,
        form_templates.form_type,
        form_templates.is_global,
        form_templates.fields
      `,
      filter: [
        ...(formType ? [{ column: 'form_type', value: formType }] : []),
        { column: 'is_public', value: true },
        { column: 'is_global', value: false }
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
