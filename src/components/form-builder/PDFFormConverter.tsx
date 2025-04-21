
import React, { useState } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Upload } from 'lucide-react';
import { PDFFormConverterProps } from '@/types/form-builder-types';
import { useFormTemplates } from '@/hooks/form-builder/useFormTemplates';
import { usePDFConversion } from '@/hooks/form-builder/usePDFConversion';
import { PDFConversionStatus } from './PDFConversionStatus';
import { toast } from 'sonner';

export const PDFFormConverter: React.FC<PDFFormConverterProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'templates'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: templates = [] } = useFormTemplates(associationId);
  const { startConversion, conversionJobs = [], isLoading } = usePDFConversion(associationId);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleConvertPDF = async () => {
    if (!selectedFile) return;
    await startConversion(selectedFile);
  };

  const handleCopyTemplate = async (templateId: string) => {
    toast.success('Template copied successfully');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'templates')}>
        <TabsList>
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="templates">Copy From Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Convert PDF to Online Form</CardTitle>
              <CardDescription>
                Upload a PDF form to automatically convert it into an online form template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onFileSelect={handleFileSelect}
                accept=".pdf"
                label="Upload PDF Form"
              />
              {selectedFile && (
                <Button 
                  onClick={handleConvertPDF}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Convert PDF to Form
                </Button>
              )}
              
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Recent Conversions</h3>
                <div className="space-y-2">
                  {conversionJobs.map((job: any) => (
                    <PDFConversionStatus
                      key={job.id}
                      status={job.status}
                      filename={job.original_pdf_url.split('/').pop()}
                      createdAt={job.created_at}
                      error={job.error_message}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Copy Existing Templates</CardTitle>
              <CardDescription>
                Copy and customize form templates from other associations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <CardDescription>{template.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-2">
                        <Button variant="outline" onClick={() => handleCopyTemplate(template.id)}>
                          <Copy className="h-4 w-4 mr-2" /> Copy Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {associationId ? 
                      'No templates available to copy.' :
                      'Select an association above to view available templates'
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
