
// This file describes the database functions that need to be created
// for the tracking number system to work properly.
//
// SQL to create these functions:
//
// -- Create a sequence for tracking numbers
// CREATE SEQUENCE IF NOT EXISTS communication_tracking_seq START 1;
//
// -- Create a function to get and increment tracking number atomically
// CREATE OR REPLACE FUNCTION get_next_tracking_number()
// RETURNS BIGINT
// LANGUAGE SQL
// AS $$
//   SELECT nextval('communication_tracking_seq')
// $$;
//
// -- Create the communications log table
// CREATE TABLE IF NOT EXISTS public.communications_log (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   tracking_number TEXT NOT NULL UNIQUE,
//   communication_type TEXT NOT NULL,
//   metadata JSONB,
//   received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
//   processed_at TIMESTAMP WITH TIME ZONE,
//   status TEXT NOT NULL DEFAULT 'received',
//   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
//   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
// );
//
// -- Add tracking_number column to invoices
// ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tracking_number TEXT;
//
// -- Add tracking_number column to leads
// ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tracking_number TEXT;
//
// -- Create indexes for better performance
// CREATE INDEX IF NOT EXISTS idx_communications_log_tracking_number ON public.communications_log(tracking_number);
// CREATE INDEX IF NOT EXISTS idx_invoices_tracking_number ON public.invoices(tracking_number);
// CREATE INDEX IF NOT EXISTS idx_leads_tracking_number ON public.leads(tracking_number);
//
// -- Trigger to update updated_at timestamp
// CREATE OR REPLACE FUNCTION update_communications_updated_at()
// RETURNS TRIGGER AS $$
// BEGIN
//   NEW.updated_at = now();
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;
//
// CREATE TRIGGER update_communications_updated_at
// BEFORE UPDATE ON communications_log
// FOR EACH ROW
// EXECUTE PROCEDURE update_communications_updated_at();
