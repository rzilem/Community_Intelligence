
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { File, Plus } from 'lucide-react';
import { useLetterTemplates } from '@/hooks/letters/useLetterTemplates';
import { LetterTemplate } from '@/types/letter-template-types';
import LetterTemplateList from '@/components/letters/LetterTemplateList';
import LetterTemplateEditor from '@/components/letters/LetterTemplateEditor';
import LetterTemplateCategoryFilter from '@/components/letters/LetterTemplateCategoryFilter';
import { toast } from 'sonner';

const LetterTemplates = () => {
  const { templates, createTemplate, updateTemplate } = useLetterTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const filteredTemplates = selectedCategory 
    ? templates.filter(template => template.category === selectedCategory)
    : templates;
  
  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedTemplate(null);
    setIsCreatingNew(false);
  };
  
  const handleSelectTemplate = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setIsCreatingNew(false);
  };
  
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsCreatingNew(true);
  };
  
  const handleSaveTemplate = (template: Partial<LetterTemplate>) => {
    if (selectedTemplate) {
      updateTemplate(selectedTemplate.id, template);
      setSelectedTemplate(prev => prev ? { ...prev, ...template } : null);
      toast.success('Template updated successfully');
    } else {
      const newTemplate = createTemplate(template);
      setSelectedTemplate(newTemplate);
      setIsCreatingNew(false);
      toast.success('Template created successfully');
    }
  };
  
  const renderActionButton = () => (
    <Button 
      onClick={handleCreateNew} 
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" /> New Template
    </Button>
  );
  
  return (
    <PageTemplate 
      title="Letter Templates" 
      icon={<File className="h-8 w-8" />}
      description="Create and manage templates for community correspondence."
      actions={renderActionButton()}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Manage Letter Templates</h2>
          <p className="text-muted-foreground">
            Create, edit and organize templates for various communication needs
          </p>
        </div>
        
        <LetterTemplateCategoryFilter
          selectedCategory={selectedCategory || 'all'}
          onSelectCategory={handleSelectCategory}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Templates</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateNew}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> 
                New Template
              </Button>
            </div>
            
            <LetterTemplateList
              templates={filteredTemplates}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
          
          <div className="md:col-span-2">
            {isCreatingNew || selectedTemplate ? (
              <LetterTemplateEditor
                template={selectedTemplate || undefined}
                onSave={handleSaveTemplate}
              />
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md p-6">
                <div className="text-center">
                  <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
                  <p className="text-gray-500 mb-4">
                    Select a template from the list to edit or create a new one.
                  </p>
                  <Button onClick={handleCreateNew}>
                    Create New Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default LetterTemplates;
