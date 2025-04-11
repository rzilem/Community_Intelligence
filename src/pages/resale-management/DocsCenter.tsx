
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, ClipboardList, BookOpen, Map, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import DocsCenterDocuments from '@/components/resale/docs-center/DocsCenterDocuments';
import DocsCenterTemplates from '@/components/resale/docs-center/DocsCenterTemplates';
import DocsCenterQuestionnaires from '@/components/resale/docs-center/DocsCenterQuestionnaires';
import DocsCenterAddOns from '@/components/resale/docs-center/DocsCenterAddOns';

const DocsCenter = () => {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <PageTemplate 
      title="Docs Center" 
      icon={<FileText className="h-8 w-8" />}
      description="Manage resale documents, templates, questionnaires and additional order products."
    >
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="documents" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                <span>Resale Templates</span>
              </TabsTrigger>
              <TabsTrigger value="questionnaires" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                <span>Questionnaires</span>
              </TabsTrigger>
              <TabsTrigger value="add-ons" className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>Add-on Products</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-0">
              <DocsCenterDocuments />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-0">
              <DocsCenterTemplates />
            </TabsContent>
            
            <TabsContent value="questionnaires" className="mt-0">
              <DocsCenterQuestionnaires />
            </TabsContent>
            
            <TabsContent value="add-ons" className="mt-0">
              <DocsCenterAddOns />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default DocsCenter;
