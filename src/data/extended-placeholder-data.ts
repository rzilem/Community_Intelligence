// Extended Placeholder Data - Phase 2
// Additional data structures for complete coverage

import { PLACEHOLDER_HOA, PLACEHOLDER_PROPERTIES, PLACEHOLDER_VENDORS } from './placeholder-data';

export * from './placeholder-data';

export const PLACEHOLDER_MAINTENANCE_REQUESTS = [
  {
    id: 'maint-1',
    hoa_id: 'default-hoa',
    property_id: 'prop-1',
    vendor_id: 'vendor-2',
    requested_by: 'res-1',
    title: 'Leaking faucet in kitchen',
    description: 'Kitchen faucet has been dripping constantly for the past week',
    category: 'plumbing',
    priority: 'high',
    status: 'in_progress',
    estimated_cost: 250.00,
    actual_cost: null,
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    completed_date: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'maint-2',
    hoa_id: 'default-hoa',
    property_id: null,
    vendor_id: 'vendor-1',
    requested_by: null,
    title: 'Broken sprinkler head - North lawn',
    description: 'Sprinkler head near building A is broken and flooding the area',
    category: 'landscaping',
    priority: 'medium',
    status: 'assigned',
    estimated_cost: 75.00,
    actual_cost: null,
    scheduled_date: new Date(Date.now() + 172800000).toISOString(),
    completed_date: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const PLACEHOLDER_VIOLATIONS = [
  {
    id: 'viol-1',
    hoa_id: 'default-hoa',
    property_id: 'prop-2',
    violation_type: 'Landscaping',
    description: 'Overgrown grass exceeding 6 inches in height',
    severity: 'minor',
    status: 'warning_sent',
    reported_date: new Date(Date.now() - 604800000).toISOString(),
    reported_by: 'admin-1',
    cure_by_date: new Date(Date.now() + 604800000).toISOString(),
    resolved_date: null,
    fine_amount: 0,
    notes: 'First warning sent via email',
    photos: [],
    created_at: new Date(Date.now() - 604800000).toISOString()
  }
];

export const PLACEHOLDER_ASSESSMENTS = [
  {
    id: 'assess-1',
    hoa_id: 'default-hoa',
    property_id: 'prop-1',
    assessment_type: 'regular',
    description: 'October 2025 HOA Dues',
    amount: 250.00,
    due_date: '2025-10-01',
    payment_status: 'paid',
    payment_date: '2025-09-25',
    payment_method: 'ach',
    transaction_id: 'txn_123456',
    current_balance: 0,
    created_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 'assess-2',
    hoa_id: 'default-hoa',
    property_id: 'prop-2',
    assessment_type: 'regular',
    description: 'October 2025 HOA Dues',
    amount: 250.00,
    due_date: '2025-10-01',
    payment_status: 'pending',
    current_balance: 250.00,
    created_at: '2025-09-01T00:00:00Z'
  }
];

export const PLACEHOLDER_CALENDAR_EVENTS = [
  {
    id: 'event-1',
    hoa_id: 'default-hoa',
    title: 'Monthly Board Meeting',
    description: 'Regular monthly HOA board meeting. All residents welcome.',
    start_date: new Date(Date.now() + 604800000).toISOString(),
    end_date: new Date(Date.now() + 611800000).toISOString(),
    location: 'Community Center - Conference Room A',
    type: 'meeting',
    status: 'scheduled',
    is_public: true,
    attendees: [],
    created_by: 'admin-1',
    created_at: new Date(Date.now() - 1209600000).toISOString()
  }
];

export const PLACEHOLDER_INVOICES = [
  {
    id: 'inv-1',
    hoa_id: 'default-hoa',
    vendor_id: 'vendor-1',
    invoice_number: 'INV-2025-001',
    invoice_date: '2025-09-15',
    due_date: '2025-10-15',
    amount: 3500.00,
    status: 'pending',
    description: 'Monthly landscaping services - September 2025',
    line_items: [
      { description: 'Lawn mowing and edging', quantity: 4, rate: 500, amount: 2000 },
      { description: 'Tree trimming', quantity: 1, rate: 800, amount: 800 }
    ],
    created_at: '2025-09-15T10:00:00Z'
  }
];

export const PLACEHOLDER_ACCOUNTS_RECEIVABLE = [
  {
    id: 'ar-1',
    property_id: 'prop-2',
    resident_id: 'res-2',
    current_balance: 250.00,
    past_due_amount: 0,
    last_payment_date: null,
    due_date: '2025-10-01'
  }
];

export const PLACEHOLDER_AI_MODEL_PERFORMANCE = [
  {
    id: 'model-1',
    model_name: 'delinquency_predictor',
    accuracy_score: 0.85,
    last_trained: new Date(Date.now() - 604800000).toISOString(),
    performance_metrics: {
      precision: 0.82,
      recall: 0.88,
      f1_score: 0.85
    }
  }
];