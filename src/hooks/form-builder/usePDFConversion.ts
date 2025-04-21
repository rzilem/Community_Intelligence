
import { useSupabaseCreate, useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { FormField, FormFieldType } from '@/types/form-builder-types';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';

export function usePDFConversion(associationId?: string) {
  const createConversionJob = useSupabaseCreate('form_conversion_jobs', {
    onSuccess: () => {
      toast.success('PDF conversion started');
    }
  });

  const { data: conversionJobs = [], isLoading } = useSupabaseQuery(
    'form_conversion_jobs',
    {
      select: '*',
      filter: associationId ? [{ column: 'association_id', value: associationId }] : [],
      order: { column: 'created_at', ascending: false }
    }
  );

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Correctly use the Tesseract.js v5 API
      const worker = await createWorker();
      
      // Configure for better form field recognition using the correct API
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Set parameters for better recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-_()',
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  };

  const analyzePDFContent = async (text: string): Promise<FormField[]> => {
    // Basic field detection logic
    const fields: FormField[] = [];
    
    // Split text into lines
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Look for common form field patterns
      if (line.match(/name|email|phone|address|date|signature/i)) {
        const fieldName = line.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        let fieldType: FormFieldType = 'text';
        if (line.match(/email/i)) fieldType = 'email';
        if (line.match(/phone/i)) fieldType = 'phone';
        if (line.match(/date/i)) fieldType = 'date';
        if (line.match(/signature/i)) fieldType = 'signature';
        
        fields.push({
          id: crypto.randomUUID(),
          type: fieldType,
          label: line.trim(),
          required: false,
          placeholder: `Enter ${line.trim().toLowerCase()}`
        });
      }
    }
    
    return fields;
  };

  const startConversion = async (file: File) => {
    if (!associationId) {
      toast.error('Please select an association first');
      return;
    }

    try {
      // Upload PDF to storage
      const filePath = `${associationId}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('form-pdfs')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Failed to upload PDF');
        throw uploadError;
      }

      // Extract text from PDF
      const extractedText = await extractTextFromPDF(file);
      
      // Analyze content and detect form fields
      const detectedFields = await analyzePDFContent(extractedText);

      // Create conversion job
      await createConversionJob.mutateAsync({
        association_id: associationId,
        original_pdf_url: uploadData.path,
        status: 'processing',
        metadata: {
          extracted_text: extractedText,
          detected_fields: detectedFields
        }
      });

      // Create form template from detected fields
      // Convert FormField[] to stringified JSON before sending to Supabase
      const { error: templateError } = await supabase
        .from('form_templates')
        .insert({
          association_id: associationId,
          name: file.name.replace('.pdf', ''),
          description: 'Converted from PDF',
          fields: JSON.stringify(detectedFields),
          metadata: {
            source_pdf: uploadData.path,
            conversion_date: new Date().toISOString()
          }
        });

      if (templateError) {
        toast.error('Failed to create form template');
        throw templateError;
      }
      
      toast.success('PDF successfully converted to form template');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert PDF');
    }
  };

  return {
    startConversion,
    conversionJobs,
    isLoading
  };
}
