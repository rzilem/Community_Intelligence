import React, { useState } from 'react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, ArrowRight } from 'lucide-react';
import { useWidgetAnalytics } from '@/hooks/portal/useWidgetAnalytics';
import { FormTemplate } from '@/types/form-builder-types';
import { useAssociationFormTemplates } from '@/hooks/form-builder/useAssociationFormTemplates';
import { useAuth } from '@/contexts/auth';
import { useRequestForm } from '@/hooks/portal/useRequestForm';
import FormSubmissionDialog from '../homeowner/forms/FormSubmissionDialog';

interface FormWidgetProps extends BaseWidgetProps {
  formData?: {
    id: string;
    title: string;
    description?: string;
  };
}

const FormWidget: React.FC<FormWidgetProps> = ({ 
  widgetId = 'form-widget', 
  saveSettings, 
  isLoading = false,
  isSaving = false,
  settings = {},
  dragHandleProps
}) => {
  const [formSelectionOpen, setFormSelectionOpen] = useState(false);
  const { currentAssociation } = useAuth();
  const { trackAction } = useWidgetAnalytics(widgetId, 'form-widget');
  
  const { data: forms = [], isLoading: formsLoading } = useAssociationFormTemplates(
    currentAssociation?.id,
    'portal_request'
  );

  const {
    isSubmitFormDialogOpen,
    setIsSubmitFormDialogOpen,
    selectedForm,
    formData,
    handleFormSelection,
    handleFieldChange,
    handleFormSubmit,
    isSubmitting,
    submissionStatus = '',
    submissionId = ''
  } = useRequestForm();
  
  const getFormData = () => {
    return settings.formData || {
      id: 'sample-form',
      title: 'Quick Request Form',
      description: 'Submit a request quickly using this form.'
    };
  };
  
  const handleOpenFormSelection = () => {
    setFormSelectionOpen(true);
    trackAction('form_selection_opened');
  };

  const handleSelectForm = (form: FormTemplate) => {
    setFormSelectionOpen(false);
    handleFormSelection(form);
  };
  
  return (
    <>
      <DashboardWidget 
        title={settings.title || 'Quick Form'} 
        widgetType="form-widget"
        isLoading={isLoading || formsLoading}
        isSaving={isSaving}
        dragHandleProps={dragHandleProps}
      >
        <div className="flex flex-col space-y-3">
          <Card className="border border-muted bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={handleOpenFormSelection}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">{getFormData().title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {getFormData().description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" onClick={handleOpenFormSelection} className="w-full">
            Submit Quick Request
          </Button>
        </div>
      </DashboardWidget>
      
      {/* Form Selection Dialog */}
      <Dialog open={formSelectionOpen} onOpenChange={setFormSelectionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Choose a Request Form</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            {formsLoading ? (
              <p className="text-center text-muted-foreground">Loading forms...</p>
            ) : forms.length > 0 ? (
              forms.map(form => (
                <Card 
                  key={form.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectForm(form)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{form.name}</h3>
                        {form.description && (
                          <p className="text-sm text-muted-foreground">{form.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No request forms available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Submission Dialog */}
      <FormSubmissionDialog
        open={isSubmitFormDialogOpen}
        onOpenChange={setIsSubmitFormDialogOpen}
        form={selectedForm}
        values={formData}
        onFieldChange={handleFieldChange}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        status={submissionStatus}
        submissionId={submissionId}
      />
    </>
  );
};

export default FormWidget;
