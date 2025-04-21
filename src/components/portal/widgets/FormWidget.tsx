
import React, { useState } from 'react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, ArrowRight } from 'lucide-react';
import { useWidgetAnalytics } from '@/hooks/portal/useWidgetAnalytics';

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
  const [formOpen, setFormOpen] = useState(false);
  const { trackAction } = useWidgetAnalytics(widgetId, 'form-widget');
  
  // Get form data from settings or use default
  const formData = settings.formData || {
    id: 'sample-form',
    title: 'Request Form',
    description: 'Submit a request using this form.'
  };
  
  const handleOpenForm = () => {
    setFormOpen(true);
    trackAction('form_opened');
  };
  
  return (
    <>
      <DashboardWidget 
        title={settings.title || 'Quick Form'} 
        widgetType="form-widget"
        isLoading={isLoading}
        isSaving={isSaving}
        dragHandleProps={dragHandleProps}
      >
        <div className="flex flex-col space-y-3">
          <Card className="border border-muted bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={handleOpenForm}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-10 w-10 text-primary mr-3" />
                  <div>
                    <h3 className="font-medium">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {formData.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" onClick={handleOpenForm} className="w-full">
            Open Form
          </Button>
        </div>
      </DashboardWidget>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{formData.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* This would be replaced with actual form components from the builder */}
            <div className="flex flex-col space-y-4 p-4 border rounded-md">
              <p className="text-sm text-muted-foreground">
                This is a placeholder for the dynamic form that would be loaded from the Form Builder.
                The actual form would include fields, validation, and submission handling.
              </p>
              <div className="flex justify-end">
                <Button>Submit</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormWidget;
