-- Enable RLS and add policies for Phase 1 tables
ALTER TABLE assessment_types_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for association-based access
CREATE POLICY "Users can access assessment types for their associations" ON assessment_types_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment methods for their associations" ON payment_methods
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment transactions for their associations" ON payment_transactions_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collections cases for their associations" ON collections_cases
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collections activities for their associations" ON collections_activities
  FOR ALL USING (collections_case_id IN (
    SELECT id FROM collections_cases WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access accounts receivable for their associations" ON accounts_receivable
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment allocations for their associations" ON payment_allocations
  FOR ALL USING (payment_transaction_id IN (
    SELECT id FROM payment_transactions_enhanced WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access account credits for their associations" ON account_credits
  FOR ALL USING (check_user_association(association_id));