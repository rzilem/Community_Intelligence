
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseQuery } from '@/hooks/supabase/use-supabase-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateDocumentProps {
  submissionId: string;
  formTemplateId: string;
}

export const GenerateDocument: React.FC<GenerateDocumentProps> = ({
  submissionId,
  formTemplateId,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const { data: templates = [], isLoading } = useSupabaseQuery(
    'document_templates',
    {
      select: '*',
      filter: [{ column: 'form_template_id', value: formTemplateId }],
    }
  );

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          submissionId,
          templateId: selectedTemplate,
        },
      });

      if (error) throw error;

      toast.success('Document generated successfully');
      window.open(data.file_url, '_blank');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <Select 
        value={selectedTemplate} 
        onValueChange={setSelectedTemplate}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template: any) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !selectedTemplate}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate Document
          </>
        )}
      </Button>
    </div>
  );
};
