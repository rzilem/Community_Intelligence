
export interface EmailTemplateVariables {
  payment?: {
    amount: number;
    dueDate: string;
    lateFee: number;
  };
  compliance?: {
    violationType: string;
    description: string;
    dueDate: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: EmailTemplateVariables;
}
