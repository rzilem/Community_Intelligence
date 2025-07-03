-- Add indexes and core functions for Phase 1
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_property ON payment_transactions_enhanced(property_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions_enhanced(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_collections_cases_property ON collections_cases(property_id);
CREATE INDEX IF NOT EXISTS idx_collections_cases_status ON collections_cases(status);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_property ON accounts_receivable(property_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_aging ON accounts_receivable(aging_bucket);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON accounts_receivable(due_date);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_aging_days()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aging_days = GREATEST(0, EXTRACT(days FROM CURRENT_DATE - NEW.due_date));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ar_aging_trigger
  BEFORE INSERT OR UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION update_aging_days();

-- Function to automatically allocate payments
CREATE OR REPLACE FUNCTION auto_allocate_payment(p_payment_id UUID)
RETURNS VOID AS $$
DECLARE
  payment_rec RECORD;
  ar_rec RECORD;
  remaining_amount DECIMAL(10,2);
  allocation_amount DECIMAL(10,2);
BEGIN
  -- Get payment details
  SELECT * INTO payment_rec FROM payment_transactions_enhanced WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  remaining_amount := payment_rec.net_amount;
  
  -- Allocate to oldest invoices first
  FOR ar_rec IN 
    SELECT * FROM accounts_receivable 
    WHERE property_id = payment_rec.property_id 
    AND status IN ('open', 'partial')
    AND current_balance > 0
    ORDER BY due_date ASC
  LOOP
    EXIT WHEN remaining_amount <= 0;
    
    allocation_amount := LEAST(remaining_amount, ar_rec.current_balance);
    
    -- Create allocation record
    INSERT INTO payment_allocations (
      payment_transaction_id,
      accounts_receivable_id,
      allocated_amount,
      allocation_type
    ) VALUES (
      p_payment_id,
      ar_rec.id,
      allocation_amount,
      'automatic'
    );
    
    -- Update AR balance
    UPDATE accounts_receivable 
    SET 
      current_balance = current_balance - allocation_amount,
      paid_amount = paid_amount + allocation_amount,
      status = CASE 
        WHEN current_balance - allocation_amount = 0 THEN 'paid'
        ELSE 'partial'
      END,
      last_payment_date = payment_rec.payment_date
    WHERE id = ar_rec.id;
    
    remaining_amount := remaining_amount - allocation_amount;
  END LOOP;
  
  -- If there's remaining amount, create credit
  IF remaining_amount > 0 THEN
    INSERT INTO account_credits (
      property_id,
      association_id,
      credit_type,
      amount,
      remaining_balance,
      description,
      credit_date
    ) VALUES (
      payment_rec.property_id,
      payment_rec.association_id,
      'overpayment',
      remaining_amount,
      remaining_amount,
      'Overpayment from transaction ' || payment_rec.reference_number,
      payment_rec.payment_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;