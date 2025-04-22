
import { useSupabaseQuery } from '@/hooks/supabase';
import { FormTemplate, FormType } from '@/types/form-builder-types';

export function useAssociationForms(associationId?: string, formType?: FormType) {
  return useSupabaseQuery<FormTemplate[]>(
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
        { column: 'is_public', value: true }
      ]
    }
  );
}
