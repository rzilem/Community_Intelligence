
import React, { useState } from 'react';
import { FileText, Plus, Settings } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FormBuilderTemplates } from '@/components/form-builder/FormBuilderTemplates';
import { FormSubmissions } from '@/components/form-builder/FormSubmissions';
import { FormBuilderSettings } from '@/components/form-builder/FormBuilderSettings';
import { NewFormDialog } from '@/components/form-builder/NewFormDialog';
import { PDFFormConverter } from '@/components/form-builder/PDFFormConverter';
import AssociationSelector from '@/components/associations/AssociationSelector';

const FormBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Form Builder" 
      icon={<FileText className="h-8 w-8" />}
      description="Create and manage forms for portal users and external websites."
      actions={
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsNewFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Form
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <AssociationSelector 
          onAssociationChange={handleAssociationChange}
          initialAssociationId={selectedAssociationId}
          label="Filter by Association"
        />
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="pdf-converter">PDF Converter</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <FormBuilderTemplates associationId={selectedAssociationId} />
        </TabsContent>

        <TabsContent value="pdf-converter">
          <PDFFormConverter associationId={selectedAssociationId} />
        </TabsContent>
        
        <TabsContent value="submissions">
          <FormSubmissions associationId={selectedAssociationId} />
        </TabsContent>
        
        <TabsContent value="settings">
          <FormBuilderSettings />
        </TabsContent>
      </Tabs>

      <NewFormDialog 
        open={isNewFormDialogOpen} 
        onOpenChange={setIsNewFormDialogOpen}
        associationId={selectedAssociationId}
      />
    </PageTemplate>
  );
};

export default FormBuilder;
