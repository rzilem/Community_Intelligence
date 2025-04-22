
import { useSupabaseQuery } from '@/hooks/supabase';
import type { FormTemplate } from '@/types/form-builder-types';

export function useFormTemplates(associationId?: string) {
  return useSupabaseQuery<FormTemplate[]>(
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
        ...(associationId ? [{ column: 'association_id', value: associationId }] : []),
        { column: 'is_public', value: true, operator: 'eq' }
      ],
      order: { column: 'created_at', ascending: false }
    }
  );
}
