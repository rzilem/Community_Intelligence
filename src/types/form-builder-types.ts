export type FormFieldType = 
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'hidden'
  | 'signature';

export type FormSubmissionStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processed'
  | 'archived';

export type FormEndpointType = 
  | 'external'
  | 'internal'
  | 'email'
  | 'database';

export type FormIntegrationTarget = 
  | 'homeowner_request'
  | 'work_order'
  | 'maintenance_request'
  | 'resale_order'
  | 'custom';

export type FormType = 
  | 'portal_request'
  | 'arc_application'
  | 'pool_form'
  | 'gate_request'
  | 'other';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  defaultValue?: string | string[] | boolean | number;
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  helpText?: string;
  className?: string;
  conditionalDisplay?: {
    dependsOn: string;
    showWhen: string | string[] | boolean | number;
  };
}

export interface FormTemplate {
  id: string;
  title?: string;
  name: string;
  description?: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
  association_id?: string;
  is_public: boolean;
  metadata?: Record<string, any>;
  category?: string;
  is_global: boolean;
  form_type: FormType | null;
  associations?: { id: string; name: string }[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  submittedBy?: string;
  status: FormSubmissionStatus;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  trackingNumber: string;
}

export interface FormWidgetSettings {
  formId: string;
  title?: string;
  showDescription?: boolean;
  buttonText?: string;
  position?: number;
}

export interface PDFFormConverterProps {
  associationId?: string;
}

export interface FormBuilderTemplatesProps {
  associationId?: string;
}

export interface NewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associationId?: string;
}

export interface FormTemplateEditorProps {
  formId: string;
  onSave?: (form: FormTemplate) => void;
  onCancel?: () => void;
}

export interface FormFieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onDelete: () => void;
}

export interface FormTemplateAssociation {
  id: string;
  form_template_id: string;
  association_id: string;
  created_at: string;
  updated_at: string;
}
