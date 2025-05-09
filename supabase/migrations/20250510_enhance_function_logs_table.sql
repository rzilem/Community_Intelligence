
-- Check if the function_logs table exists, create it if not
CREATE TABLE IF NOT EXISTS public.function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on request_id for quicker lookup
CREATE INDEX IF NOT EXISTS idx_function_logs_request_id ON public.function_logs(request_id);

-- Add index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_function_logs_timestamp ON public.function_logs(timestamp);

-- Add index on function_name for filtering
CREATE INDEX IF NOT EXISTS idx_function_logs_function_name ON public.function_logs(function_name);

-- Enable Row Level Security
ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see logs (restrict to admin role in production)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view logs"
  ON public.function_logs FOR SELECT
  TO authenticated
  USING (true);

-- Allow edge functions to insert logs
CREATE POLICY IF NOT EXISTS "Allow insertion of logs"
  ON public.function_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create an automatic cleanup function to prevent the table from growing too large
CREATE OR REPLACE FUNCTION cleanup_old_function_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 30 days
  DELETE FROM public.function_logs
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule the cleanup to run daily
SELECT cron.schedule(
  'cleanup-function-logs-daily',
  '0 0 * * *', -- Run at midnight every day
  $$
    SELECT cleanup_old_function_logs();
  $$
);
