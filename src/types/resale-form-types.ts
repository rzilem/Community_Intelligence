
export type ResaleFormType = 
  | 'resale_certificate'
  | 'condo_questionnaire'
  | 'disclosure_document'
  | 'mortgage_questionnaire'
  | 'lender_questionnaire' 
  | 'custom';

export type ResaleOrderStatus = 
  | 'submitted'
  | 'processing'
  | 'waiting_for_payment'
  | 'payment_received'
  | 'documents_ready'
  | 'completed'
  | 'canceled';

export type ResaleOrderPriority = 
  | 'standard'
  | 'rush'
  | 'super_rush';

export interface ResaleOrderType {
  id: string;
  name: string;
  description?: string;
  formType: ResaleFormType;
  basePrice: number;
  rushPrice: number;
  superRushPrice: number;
  standardTurnaround: string; // e.g., "3-5 business days"
  rushTurnaround: string; // e.g., "1-2 business days"
  superRushTurnaround: string; // e.g., "same day"
  isActive: boolean;
  requiredDocuments?: string[];
  formFields: string[]; // IDs of form fields required
}

export interface ResaleOrder {
  id: string;
  orderNumber: string;
  orderType: string; // ID of the ResaleOrderType
  propertyAddress: string;
  propertyId?: string;
  associationId: string;
  requestedBy: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    role: 'seller' | 'buyer' | 'agent' | 'lender' | 'title_company' | 'other';
  };
  priority: ResaleOrderPriority;
  status: ResaleOrderStatus;
  submittedAt: string;
  estimatedCompletionDate: string;
  completedAt?: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDetails?: {
    transactionId: string;
    amount: number;
    method: string;
    date: string;
  };
  formData: Record<string, any>;
  documents: {
    id: string;
    name: string;
    uploadedAt: string;
    url: string;
    isPublic: boolean;
  }[];
  notes?: string;
  trackingUpdates: {
    timestamp: string;
    status: ResaleOrderStatus;
    notes?: string;
    updatedBy?: string;
  }[];
}

export interface ResalePortalSettings {
  allowGuestSubmissions: boolean;
  requirePaymentUpfront: boolean;
  allowRushOrders: boolean;
  allowSuperRushOrders: boolean;
  displayPricesPublicly: boolean;
  requireDocumentUpload: boolean;
  autoNotifyOnStatusChange: boolean;
  defaultEmailTemplate: string;
  termsAndConditions: string;
  customInstructions: string;
}
