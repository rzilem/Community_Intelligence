
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FileText, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';
import { useAuth } from '@/contexts/auth';
import { useAssociationFormTemplates } from '@/hooks/form-builder/useAssociationFormTemplates';
import FormSelectionDialog from '@/components/portal/homeowner/forms/FormSelectionDialog';
import FormSubmissionDialog from '@/components/portal/homeowner/forms/FormSubmissionDialog';
import { useRequestForm } from '@/hooks/portal/useRequestForm';

const RequestsPage = () => {
  const { currentAssociation } = useAuth();
  const { data: associationForms = [], isLoading: formsLoading } = useAssociationFormTemplates(
    currentAssociation?.id,
    'portal_request'
  );
  
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isSubmitFormDialogOpen,
    setIsSubmitFormDialogOpen,
    selectedForm,
    formData,
    handleFormSelection,
    handleFieldChange,
    handleFormSubmit,
    isSubmitting
  } = useRequestForm();

  // Modified to return boolean
  const handleFormSubmitWithResult = async () => {
    await handleFormSubmit();
    return true; // Always return true for compatibility
  };

  return (
    <PortalPageLayout 
      title="Homeowner Requests" 
      icon={<FileText className="h-6 w-6" />}
      description="Submit and track requests for your property"
      portalType="homeowner"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="homeowner" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table content would go here */}
            </CardContent>
          </Card>
        </div>
      </div>

      <FormSelectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        forms={associationForms}
        formsLoading={formsLoading}
        onFormSelect={handleFormSelection}
      />

      <FormSubmissionDialog
        open={isSubmitFormDialogOpen}
        onOpenChange={setIsSubmitFormDialogOpen}
        form={selectedForm}
        values={formData}
        onFieldChange={handleFieldChange}
        onSubmit={handleFormSubmitWithResult}
        isSubmitting={isSubmitting}
      />
    </PortalPageLayout>
  );
};

export default RequestsPage;
