
import React, { useState, useEffect } from 'react';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import TemplateDialog from './TemplateDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TemplatesHeader from './templates/TemplatesHeader';
import TemplatesFilter from './templates/TemplatesFilter';
import TemplatesList from './templates/TemplatesList';
import { useTemplateActions } from './hooks/useTemplateActions';
import { useTemplateStages } from './hooks/useTemplateStages';

const OnboardingTemplates = () => {
  const { 
    templates, 
    isLoading, 
    refreshTemplates
  } = useOnboardingTemplates();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedTemplate,
    formData,
    handleInputChange,
    handleTemplateTypeChange,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog
  } = useTemplateActions();

  const {
    templateStages,
    loadingStages
  } = useTemplateStages(templates);

  useEffect(() => {
    console.log("OnboardingTemplates component loaded. Templates:", templates);
    
    if (templates.length === 0 && !isLoading) {
      console.log("No templates found, refreshing...");
      refreshTemplates();
    }
  }, [templates, isLoading, refreshTemplates]);

  const filteredTemplates = activeTab === 'all' 
    ? templates 
    : templates.filter(t => t.template_type === activeTab);

  return (
    <div className="space-y-6">
      <TemplatesHeader 
        templateCount={templates.length}
        onCreateClick={openCreateDialog}
      />
      
      <TemplatesFilter 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TemplatesList 
        templates={templates}
        filteredTemplates={filteredTemplates}
        templateStages={templateStages}
        loadingStages={loadingStages}
        isLoading={isLoading}
        onCreateClick={openCreateDialog}
        onEditTemplate={openEditDialog}
        onDeleteTemplate={openDeleteDialog}
      />

      <TemplateDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onTemplateTypeChange={handleTemplateTypeChange}
        onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isEditing={!!selectedTemplate}
      />

      <DeleteConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteTemplate}
        itemName={selectedTemplate?.name || ''}
        itemType="template"
      />
    </div>
  );
};

export default OnboardingTemplates;
