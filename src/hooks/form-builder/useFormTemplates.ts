
import { useSupabaseQuery } from '@/hooks/supabase';
import type { FormTemplate } from '@/types/form-builder-types';

export function useFormTemplates(associationId?: string) {
  // If associationId is provided, get forms for that association plus global forms
  // If not, get all forms the user has access to
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
      ],
      order: { column: 'created_at', ascending: false }
    }
  );
}
