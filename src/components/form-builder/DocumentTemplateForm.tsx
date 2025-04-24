
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSupabaseCreate } from '@/hooks/supabase/use-supabase-create';

interface DocumentTemplateFormData {
  name: string;
  description?: string;
  template_content: string;
  form_template_id?: string;
}

interface DocumentTemplateFormProps {
  formTemplateId?: string;
  onSuccess?: () => void;
}

export const DocumentTemplateForm: React.FC<DocumentTemplateFormProps> = ({
  formTemplateId,
  onSuccess
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentTemplateFormData>();
  const { mutate: createTemplate, isPending: isLoading } = useSupabaseCreate('document_templates');

  const onSubmit = async (data: DocumentTemplateFormData) => {
    try {
      await createTemplate({
        ...data,
        form_template_id: formTemplateId,
      });
      toast.success('Document template created successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create document template');
      console.error('Error creating template:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          placeholder="Template Name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          placeholder="Description (optional)"
          {...register('description')}
        />
      </div>

      <div>
        <Textarea
          placeholder="Template Content (use {{field_name}} for form fields)"
          className="min-h-[200px]"
          {...register('template_content', { required: 'Content is required' })}
        />
        {errors.template_content && (
          <p className="text-sm text-destructive">{errors.template_content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Template'}
      </Button>
    </form>
  );
};
