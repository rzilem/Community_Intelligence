import { Database } from '@/integrations/supabase/types';

// Use database types directly to avoid conflicts

export type PaymentMethod = Database['public']['Tables']['resident_payment_methods']['Row'];
export type PaymentTransaction = Database['public']['Tables']['payment_transactions_enhanced']['Row'];
export type CollectionCase = Database['public']['Tables']['collection_cases']['Row'];
export type CollectionAction = Database['public']['Tables']['collection_actions']['Row'];