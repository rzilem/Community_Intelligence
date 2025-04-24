
export interface Association {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'inactive' | 'pending' | string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  total_units?: number;
  contact_email?: string;
  is_archived?: boolean;
  property_type?: string;
  founded_date?: string;
  website?: string;
  phone?: string;
  country?: string;
  fire_inspection_due?: string;
  insurance_expiration?: string;
  // Payment settings
  payment_due_day?: string;
  late_fee_percentage?: string;
  grace_period_days?: string;
  // Communication preferences
  email_notifications?: boolean;
  sms_notifications?: boolean;
  auto_reminders?: boolean;
  // ACH Settings
  ach_auto_draft_day?: string;
  ach_generate_in_advance?: number | null;
  ach_draft_amount?: string;
  ach_include_charges?: string;
  // ARC Settings
  arc_model?: string;
  additional_arc_models?: any;
  require_arc_voting?: boolean;
  approval_threshold?: number | null;
  decline_threshold?: number | null;
  arc_name?: string;
  // Collections Settings
  collections_active?: string;
  collections_model?: string;
  processing_days?: string;
  additional_collections_models?: any;
  minimum_balance?: number | null;
  age_of_balance?: string;
  balance_threshold_type?: string;
  balance_threshold?: string;
  lien_threshold_type?: string;
  lien_threshold?: string;
  new_association_grace_period?: string;
  new_owner_grace_period?: string;
  board_approval_required?: boolean;
  // Statement Settings
  association_address_setting?: string;
  statement_format?: string;
  remittance_coupon_message?: string;
  utilities_billing_message?: string;
  include_block_ledger_accounts?: boolean;
  include_ach_default?: boolean;
  include_all_properties_default?: boolean;
  include_credit_balances_default?: boolean;
  include_qr_code?: boolean;
  // Miscellaneous
  association_time_zone?: string;
  [key: string]: any;
}

export interface AssociationAIIssue {
  id: string;
  association_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
}
