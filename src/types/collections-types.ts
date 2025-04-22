
import { CollectionAccount, CollectionPaymentPlan, CollectionPayment } from '@/hooks/collections/useCollectionsData';

export interface CollectionAccountWithDetails extends CollectionAccount {
  paymentPlans?: CollectionPaymentPlan[];
  payments?: CollectionPayment[];
}

export interface PaymentPlanFormData {
  plan_type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  monthly_amount: number;
  notes?: string;
}

export interface CollectionsNotification {
  id: string;
  account_id: string;
  subject: string;
  message: string;
  sent_date: string;
  status: 'scheduled' | 'sent' | 'failed';
  notification_type: 'email' | 'letter' | 'sms';
}
