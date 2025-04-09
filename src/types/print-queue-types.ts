
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'failed';

export type PrintJobType = 
  | 'Board Documents'
  | 'Financial Documents'
  | 'Communications'
  | 'Compliance'
  | 'Letters'
  | 'Notices';

export interface PrintJob {
  id: string;
  name: string;
  type: PrintJobType;
  association_name: string;
  association_id: string;
  pages: number;
  copies: number;
  status: PrintJobStatus;
  certified: boolean;
  created_at: string;
  scheduled_for?: string;
  completed_at?: string;
}

export interface PrintSettings {
  defaultPrinter: string;
  doubleSided: boolean;
  includeMailingLabels: boolean;
  previewBeforePrint: boolean;
}
