
import { useSupabaseCreate, useSupabaseQuery } from '@/hooks/supabase';
import { toast } from 'sonner';

export function usePDFConversion(associationId?: string) {
  const createConversionJob = useSupabaseCreate('form_conversion_jobs', {
    onSuccess: () => {
      toast.success('PDF conversion started');
    }
  });

  const { data: conversionJobs, isLoading } = useSupabaseQuery(
    'form_conversion_jobs',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
      order: { column: 'created_at', ascending: false }
    }
  );

  const startConversion = async (file: File) => {
    if (!associationId) {
      toast.error('Please select an association first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Upload PDF to storage first
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('form-pdfs')
      .upload(`${associationId}/${file.name}`, file);

    if (uploadError) {
      toast.error('Failed to upload PDF');
      return;
    }

    // Create conversion job
    await createConversionJob.mutateAsync({
      association_id: associationId,
      original_pdf_url: uploadData.path,
      status: 'pending'
    });
  };

  return {
    startConversion,
    conversionJobs,
    isLoading
  };
}
