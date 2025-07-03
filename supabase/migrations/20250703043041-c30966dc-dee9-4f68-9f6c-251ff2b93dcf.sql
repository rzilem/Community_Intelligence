-- Fix Purchase Orders table - add missing columns
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id);

-- Fix Receipt Lines table - add missing columns
ALTER TABLE receipt_lines 
ADD COLUMN IF NOT EXISTS unit_price numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS po_line_id uuid;

-- Fix Receipts table - add vendor relationship
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id),
ADD COLUMN IF NOT EXISTS total_received numeric(10,2) DEFAULT 0;

-- Create Three Way Matches table (rename from three_way_matching)
CREATE TABLE IF NOT EXISTS three_way_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  receipt_id uuid REFERENCES receipts(id),
  invoice_id uuid REFERENCES invoices(id),
  match_status text NOT NULL DEFAULT 'pending',
  match_type text NOT NULL DEFAULT 'automatic',
  variance_amount numeric(10,2) DEFAULT 0,
  variance_percentage numeric(5,2) DEFAULT 0,
  tolerance_exceeded boolean DEFAULT false,
  exception_reason text,
  matched_by uuid REFERENCES profiles(id),
  matched_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approval_status ON purchase_orders(approval_status);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_po_id ON receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_receipt_lines_po_line_id ON receipt_lines(po_line_id);
CREATE INDEX IF NOT EXISTS idx_three_way_matches_po_id ON three_way_matches(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_three_way_matches_receipt_id ON three_way_matches(receipt_id);
CREATE INDEX IF NOT EXISTS idx_three_way_matches_invoice_id ON three_way_matches(invoice_id);

-- Enable RLS on new table
ALTER TABLE three_way_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for three_way_matches
CREATE POLICY "Users can access three way matches for their associations"
ON three_way_matches
FOR ALL
USING (check_user_association(association_id));

-- Add update trigger for three_way_matches
CREATE TRIGGER update_three_way_matches_updated_at
  BEFORE UPDATE ON three_way_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();