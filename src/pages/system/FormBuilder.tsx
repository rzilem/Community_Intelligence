
import React, { useState } from 'react';
import { FileText, Plus, Settings } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormBuilderTemplates } from '@/components/form-builder/FormBuilderTemplates';
import { FormSubmissions } from '@/components/form-builder/FormSubmissions';
import { FormBuilderSettings } from '@/components/form-builder/FormBuilderSettings';
import { NewFormDialog } from '@/components/form-builder/NewFormDialog';

const FormBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);

  return (
    <PageTemplate 
      title="Form Builder" 
      icon={<FileText className="h-8 w-8" />}
      description="Create and manage forms for portal users and external websites."
      actions={
        <Button onClick={() => setIsNewFormDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Form
        </Button>
      }
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <FormBuilderTemplates />
        </TabsContent>
        
        <TabsContent value="submissions">
          <FormSubmissions />
        </TabsContent>
        
        <TabsContent value="settings">
          <FormBuilderSettings />
        </TabsContent>
      </Tabs>

      <NewFormDialog 
        open={isNewFormDialogOpen} 
        onOpenChange={setIsNewFormDialogOpen} 
      />
    </PageTemplate>
  );
};

export default FormBuilder;
