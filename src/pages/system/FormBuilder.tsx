
import React, { useState } from 'react';
import { FileText, Plus, Eye, Save, ArrowLeft } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FormBuilderTemplates } from '@/components/form-builder/FormBuilderTemplates';
import { FormSubmissions } from '@/components/form-builder/FormSubmissions';
import { FormBuilderSettings } from '@/components/form-builder/FormBuilderSettings';
import { NewFormDialog } from '@/components/form-builder/NewFormDialog';
import { PDFFormConverter } from '@/components/form-builder/PDFFormConverter';
import AssociationSelector from '@/components/associations/AssociationSelector';
import FormAnalyticsDashboard from '@/components/form-builder/FormAnalyticsDashboard';
import FormPreview from '@/components/form-builder/FormPreview';
import FormSubmissionPDFExport from '@/components/form-builder/FormSubmissionPDFExport';
import { useFormTemplates } from '@/hooks/form-builder/useFormTemplates';
import { FormTemplate } from '@/types/form-builder-types';
import { FormEditor } from '@/components/form-builder/FormEditor';

const FormBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: templates = [], isLoading: templatesLoading, refetch } = useFormTemplates(selectedAssociationId);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };
  
  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    refetch();
  };

  if (isEditing && selectedTemplate) {
    return (
      <PageTemplate 
        title="Edit Form Template" 
        icon={<FileText className="h-8 w-8" />}
        backLink={{
          label: "Back to Form Builder",
          href: "#",
          onClick: () => setIsEditing(false)
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        }
      >
        <FormEditor 
          templateId={selectedTemplate.id} 
          onComplete={handleEditComplete} 
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Form Builder" 
      icon={<FileText className="h-8 w-8" />}
      description="Create and manage forms for portal users and external websites."
      actions={
        <div className="flex items-center gap-4">
          {selectedTemplate && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Edit Form
              </Button>
              
              {activeTab === 'submissions' && (
                <FormSubmissionPDFExport formTemplate={selectedTemplate} />
              )}
            </>
          )}
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

      <div className={`grid ${showPreview ? 'grid-cols-3 gap-6' : 'grid-cols-1'}`}>
        <div className={showPreview ? 'col-span-2' : 'col-span-1'}>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mt-6"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="templates">Form Templates</TabsTrigger>
              <TabsTrigger value="pdf-converter">PDF Converter</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <FormBuilderTemplates 
                associationId={selectedAssociationId} 
                onTemplateSelect={handleTemplateSelect}
                onEditTemplate={(template) => {
                  setSelectedTemplate(template);
                  setIsEditing(true);
                }}
              />
            </TabsContent>

            <TabsContent value="pdf-converter">
              <PDFFormConverter associationId={selectedAssociationId} />
            </TabsContent>
            
            <TabsContent value="submissions">
              <FormSubmissions 
                associationId={selectedAssociationId}
                templateId={selectedTemplate?.id}
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <FormAnalyticsDashboard formId={selectedTemplate?.id} />
            </TabsContent>
            
            <TabsContent value="settings">
              <FormBuilderSettings />
            </TabsContent>
          </Tabs>
        </div>

        {showPreview && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Form Preview
            </h3>
            <FormPreview form={selectedTemplate} />
          </div>
        )}
      </div>

      <NewFormDialog 
        open={isNewFormDialogOpen} 
        onOpenChange={setIsNewFormDialogOpen}
        associationId={selectedAssociationId}
        onFormCreated={(newTemplate) => {
          refetch();
          setSelectedTemplate(newTemplate);
          setIsEditing(true);
        }}
      />
    </PageTemplate>
  );
};

export default FormBuilder;
