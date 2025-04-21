
import { useSupabaseQuery } from '@/hooks/supabase';
import type { FormTemplate } from '@/types/form-builder-types';

export function useFormTemplates(associationId?: string) {
  return useSupabaseQuery<FormTemplate[]>(
    'form_templates',
    {
      select: '*',
      filter: [
        ...(associationId ? [{ column: 'association_id', value: associationId }] : []),
        { column: 'is_public', value: true, operator: 'eq' }
      ],
      order: { column: 'created_at', ascending: false }
    }
  );
}
