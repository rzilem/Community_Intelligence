-- Add RLS policies and triggers for Week 5 tables

-- Enable RLS on all new tables
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_1099_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access payment batches for their associations"
ON payment_batches FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can manage their own payment methods"
ON resident_payment_methods FOR ALL USING (
  resident_id IN (
    SELECT id FROM residents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can access payment plans for their associations"
ON payment_plans FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collection cases for their associations"
ON collection_cases FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access 1099 records for their associations"
ON vendor_1099_records FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access allocation rules for their associations"
ON payment_allocation_rules FOR ALL USING (check_user_association(association_id));

-- Update triggers
CREATE TRIGGER update_payment_batches_updated_at
  BEFORE UPDATE ON payment_batches FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resident_payment_methods_updated_at
  BEFORE UPDATE ON resident_payment_methods FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_cases_updated_at
  BEFORE UPDATE ON collection_cases FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_1099_records_updated_at
  BEFORE UPDATE ON vendor_1099_records FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_allocation_rules_updated_at
  BEFORE UPDATE ON payment_allocation_rules FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();