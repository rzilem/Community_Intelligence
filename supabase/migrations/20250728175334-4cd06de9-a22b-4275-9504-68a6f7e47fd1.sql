-- Enable realtime for invoices table
ALTER TABLE public.invoices REPLICA IDENTITY FULL;

-- Add the invoices table to the realtime publication
-- Note: This might already be done, but ensuring it's there
SELECT pg_drop_replication_slot('supabase_realtime_replication_slot') WHERE EXISTS (
  SELECT 1 FROM pg_replication_slots WHERE slot_name = 'supabase_realtime_replication_slot'
);

-- Enable RLS on invoices table if not already enabled
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;